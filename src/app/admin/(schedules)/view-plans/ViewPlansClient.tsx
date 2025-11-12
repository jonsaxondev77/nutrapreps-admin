// src/app/admin/(schedules)/view-plans/ViewPlansClient.tsx

"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import {
    useGetPlansByDateQuery,
    useDeletePlansMutation,
    useOptimizePlansMutation,
    useGenerateSheetMutation,
    useLazyGetJobStatusQuery,
    Plan, 
    PlanToGenerate,
    GenerateSheetBody,       
    RouteSegmentAssignment   
} from '@/lib/services/schedulerApi';
// --- Assumed Driver Imports (Required) ---
import { useGetAllDriversQuery } from '@/lib/services/driversApi'; 
interface Driver { id: number; firstName: string; surname: string; } 
// -----------------------------------------

import { LoaderIcon, OptimizeIcon, SheetIcon, TrashBinIcon, CloseIcon, PencilIcon } from '@/icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import DatePickerCustom from '@/components/form/date-picker-custom';
import CheckboxCustom from '@/components/form/input/CheckboxCustom';

import SplitConfigurationModal from './SplitConfigurationModal'; 

// Define the assumed types necessary for compilation and logic
interface ScheduleDetail {
    stopPosition: number;
    name: string;
    address_Line1: string;
    // Include all necessary fields for the modal to display stops
}

// New State Structure for Assignments
interface PlanAssignmentData {
    splits: number[]; // Raw list of cut points (used for backend compatibility/fallback)
    segments: RouteSegmentAssignment[]; // Full segment data with driver IDs
}


const getFallbackDate = (): Date => {
    let date = new Date();
    while (date.getDay() !== 0 && date.getDay() !== 3) {
        date.setDate(date.getDate() - 1);
    }
    return date;
};

const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getInitialDate = (dateFromUrl: string | null): Date => {
    if (dateFromUrl) {
        const [year, month, day] = dateFromUrl.split('-').map(Number);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            return new Date(year, month - 1, day);
        }
    }
    return getFallbackDate();
};

// --- NEW FUNCTION: Calculates total assignments per driver across ALL plans ---
const calculateDriverAssignmentCounts = (planAssignments: Record<string, PlanAssignmentData>): Record<number, number> => {
    const counts: Record<number, number> = {};
    
    Object.values(planAssignments).forEach(assignmentData => {
        assignmentData.segments.forEach(segment => {
            if (segment.driverId > 0) {
                counts[segment.driverId] = (counts[segment.driverId] || 0) + 1;
            }
        });
    });
    return counts;
};


export default function ViewPlansClient({downloadApiUrl } : { downloadApiUrl: string}) {
    const searchParams = useSearchParams();
    const dateFromUrl = searchParams.get('date');
    
    const [selectedDate, setSelectedDate] = useState<Date>(() => getInitialDate(dateFromUrl));
    const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // MODIFIED STATE: Stores splits and driver segments
    const [planAssignments, setPlanAssignments] = useState<Record<string, PlanAssignmentData>>({}); 

    const [currentPlanToSplit, setCurrentPlanToSplit] = useState<Plan | null>(null);
    const [modalScheduleJobId, setModalScheduleJobId] = useState<string | null>(null);
    const [modalScheduleData, setModalScheduleData] = useState<ScheduleDetail[] | null>(null);
    const [isScheduleLoading, setIsScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState<string | null>(null);


    // API Hooks
    const { data: plans = [], error: queryError, isLoading, refetch } = useGetPlansByDateQuery({ date: formatDateForApi(selectedDate) });
    const [deletePlans, { isLoading: isDeleting }] = useDeletePlansMutation();
    const [optimizePlans, { isLoading: isSubmittingOptimization }] = useOptimizePlansMutation();
    const [generateSheet, { isLoading: isSubmittingSheet }] = useGenerateSheetMutation();
    const [triggerGetJobStatus] = useLazyGetJobStatusQuery();
    
    // NEW HOOK: Fetch all drivers
    const { data: driverResponse, isLoading: driversLoading } = useGetAllDriversQuery({ pageNumber: 1, pageSize: 9999 });
    const drivers: Driver[] = driverResponse?.data || [];
    
    // --- CALCULATE GLOBAL DRIVER COUNTS ---
    const driverAssignmentCounts = calculateDriverAssignmentCounts(planAssignments);
    // -------------------------------------
    
    // MOCK FUNCTION: Starts the dedicated backend job to fetch and sort stops.
    const startScheduleFetchJob = async (planId: string, date: string) => {
        const response = await fetch(`${downloadApiUrl}/api/jobs/fetch-sorted-schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, date }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to start schedule fetch job.");
        }
        const result = await response.json();
        return result.jobId as string;
    };


    // State for jobs
    const [optimizationJobId, setOptimizationJobId] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationProgress, setOptimizationProgress] = useState(0);
    const [optimizationStatusMessage, setOptimizationStatusMessage] = useState<string | null>(null);

    const [sheetJobId, setSheetJobId] = useState<string | null>(null);
    const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
    const [sheetProgress, setSheetProgress] = useState(0);
    const [sheetStatusMessage, setSheetStatusMessage] = useState<string | null>(null);

    const optimizationPollingRef = useRef<NodeJS.Timeout | null>(null);
    const sheetPollingRef = useRef<NodeJS.Timeout | null>(null);
    
    // HANDLER for opening the split modal - TRIGGERS DATA FETCH JOB
    const handleOpenSplitModal = async (plan: Plan) => {
        // 1. Reset states
        setModalScheduleData(null); 
        setScheduleError(null);
        setModalScheduleJobId(null);

        // Block if drivers are loading or missing
        if (driversLoading || !drivers.length) {
             setScheduleError("Loading driver data... Please wait a moment.");
             setIsScheduleLoading(false);
             setCurrentPlanToSplit(null); 
             return;
        }

        // 2. Set the current plan and start loading indicator
        setCurrentPlanToSplit(plan);
        setIsScheduleLoading(true);

        try {
            // 3. Start the job
            const jobId = await startScheduleFetchJob(plan.planId, formatDateForApi(selectedDate));
            setModalScheduleJobId(jobId);
            
        } catch (e) {
            console.error(e);
            setScheduleError("Could not start schedule fetch job.");
            setIsScheduleLoading(false);
            setCurrentPlanToSplit(null); 
        }
    };

    // MODIFIED HANDLER: Saves the assignment data from the modal
    const handleSaveAssignment = (planId: string, splits: number[], segments: RouteSegmentAssignment[]) => {
        setPlanAssignments(prev => ({ 
            ...prev, 
            [planId]: { splits, segments } // Save both the raw cut points and the final segments
        }));
        handleCloseModal();
    };


    // Function to fully reset modal state
    const handleCloseModal = () => {
        setCurrentPlanToSplit(null);
        setModalScheduleData(null);
        setScheduleError(null);
        setModalScheduleJobId(null);
        setIsScheduleLoading(false);
    }


    // Generic polling logic (using useCallback for dependency stability)
    const createPoll = useCallback((
        jobId: string | null,
        isPolling: boolean,
        setIsPolling: (isPolling: boolean) => void,
        setProgress: (progress: number) => void,
        setMessage: (message: string) => void,
        setJobId: (jobId: string | null) => void,
        onComplete?: (jobId: string, data?: any) => void
    ) => {
        if (!jobId || !isPolling) return;

        const poll = async () => {
            const { data, isError, error: pollError } = await triggerGetJobStatus(jobId, false);
            if (isError || !data) {
                setError((pollError as any)?.data?.message || "Polling failed.");
                setIsPolling(false);
                setJobId(null);
                return;
            }

            if (jobId !== modalScheduleJobId) {
                setProgress(data.progress);
                setMessage(data.message);
            }

            if (data.status === 'Completed' || data.status === 'Failed') {
                setIsPolling(false);
                setJobId(null);
                
                if (data.status === 'Failed') {
                    // This block captures the backend failure and updates the UI error state
                    setError(data.message); 
                } else {
                    onComplete?.(jobId, data); 
                }
            }
        };

        // Poll faster for the modal data since the backend job is sub-second
        const interval = setInterval(poll, jobId === modalScheduleJobId ? 300 : 3000); 
        
        return () => clearInterval(interval);
    }, [modalScheduleJobId, triggerGetJobStatus]);


    // Polling Effect for Modal Schedule Data
    useEffect(() => {
        if (modalScheduleJobId) {
            const cleanup = createPoll(
                modalScheduleJobId,
                true, 
                setIsScheduleLoading,
                (p) => {}, 
                setScheduleError,
                setModalScheduleJobId,
                (jobId, jobData) => {
                    let schedules: ScheduleDetail[] = [];
                    if (jobData?.status === 'Completed') {
                        try {
                            // Safely handle parsing result which is expected to be a JSON string
                            schedules = jobData.result && typeof jobData.result === 'string' 
                                ? JSON.parse(jobData.result) 
                                : Array.isArray(jobData.result) ? jobData.result : [];

                            setModalScheduleData(schedules); // <-- Setting this opens the modal
                            setScheduleError(null); 
                        } catch (e) {
                            console.error("JSON Parsing failed for job result:", e);
                            setScheduleError("Failed to parse schedule data from job result. Check server logs.");
                            setModalScheduleData([]);
                        }
                    } else if (jobData?.status === 'Failed') {
                        setScheduleError(jobData.message || "Schedule data job failed on the server.");
                        setModalScheduleData([]);
                    }
                    
                    setIsScheduleLoading(false); 
                }
            );
            return cleanup;
        }
    }, [modalScheduleJobId, createPoll]);
    

    // Standard Polling Effect for Optimization Job
     useEffect(() => {
        const cleanup = createPoll(
            optimizationJobId,
            isOptimizing,
            setIsOptimizing,
            setOptimizationProgress,
            setOptimizationStatusMessage,
            setOptimizationJobId,
            (jobId) => { refetch(); }
        );
        return cleanup;
    }, [optimizationJobId, isOptimizing, refetch, createPoll]);
    
    // Standard Polling Effect for Sheet Generation Job
    useEffect(() => {
        if (sheetJobId && isGeneratingSheet) {
            const cleanup = createPoll(
                sheetJobId,
                isGeneratingSheet,
                setIsGeneratingSheet,
                setSheetProgress,
                setSheetStatusMessage,
                setSheetJobId,
                (jobId) => {
                    setTimeout(() => {
                        const downloadUrl = `${downloadApiUrl}/api/jobs/${jobId}/download`;
                        window.open(downloadUrl, '_blank');
                        refetch();
                    }, 500);
                }
            );
            return cleanup;
        }
        return undefined;
    }, [sheetJobId, isGeneratingSheet, downloadApiUrl, refetch, createPoll]);


    // RESTORED HANDLERS: handleOptimizePlans
    const handleOptimizePlans = async () => {
        setIsOptimizing(true);
        setOptimizationStatusMessage("Submitting optimization job...");
        try {
            const result = await optimizePlans(plans.map(p => p.planId)).unwrap();
            setOptimizationJobId(result.jobId);
        } catch (e) {
            setError((e as any)?.data?.message || 'Failed to start optimization.');
            setIsOptimizing(false);
        }
    };

    // MODIFIED HANDLER: handleGenerateSheet
    const handleGenerateSheet = async () => {
        setIsGeneratingSheet(true);
        setSheetStatusMessage("Submitting sheet generation job...");
        
        try {
            const plansToGenerate: PlanToGenerate[] = plans.map((plan: Plan) => ({
                // Use the raw splits for the PlanToGenerate list (for backend compatibility/fallback logic)
                planId: plan.planId,
                splitStops: planAssignments[plan.planId]?.splits || [], 
            }));

            // Collect ALL segments from ALL plans being generated
            const allSegments: RouteSegmentAssignment[] = plans.flatMap(plan => 
                planAssignments[plan.planId]?.segments || []
            );
            
            // Filter to ONLY include segments explicitly assigned to a driver (driverId > 0)
            const finalSegments = allSegments.filter(s => s.driverId > 0);

            const body: GenerateSheetBody = { 
                plans: plansToGenerate, 
                date: formatDateForApi(selectedDate),
                segments: finalSegments, // <--- PASS THE FINAL SEGMENT ASSIGNMENTS
            };

            const result = await generateSheet(body).unwrap();
            setSheetJobId(result.jobId);
        } catch (e) {
            setError((e as any)?.data?.message || 'Failed to start sheet generation.');
            setIsGeneratingSheet(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedPlanIds.length} plan(s)? This action cannot be undone.`)) return;
        try {
            await deletePlans(selectedPlanIds).unwrap();
            setSelectedPlanIds([]);
        } catch (e) {
            setError((e as any)?.data?.message || 'Failed to delete plans.');
        }
    };
    
    // RESTORED HANDLERS: Checkbox functions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPlanIds(e.target.checked ? plans.map(p => p.planId) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, planId: string) => {
        if (e.target.checked) {
            setSelectedPlanIds(prev => [...prev, planId]);
        } else {
            setSelectedPlanIds(prev => prev.filter(id => id !== planId));
        }
    };

    const isAllSelected = plans.length > 0 && selectedPlanIds.length === plans.length;
    const anyJobRunning = isOptimizing || isGeneratingSheet || isSubmittingOptimization || isSubmittingSheet;

    // Check if the plan data is ready to open the modal
    const isModalReady = !!currentPlanToSplit && !!modalScheduleData && !isScheduleLoading;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">View & Manage Plans</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Select a date to view, optimize, or generate reports for plans.</p>
                </div>
                <DatePickerCustom
                    id="view-plan-date-picker"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    enableSundaysAndWednesdays={true}
                />
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
                {plans.length > 0 && (
                    <>
                        <Button onClick={handleOptimizePlans} disabled={anyJobRunning || isLoading} startIcon={isOptimizing ? <LoaderIcon className="animate-spin" /> : <OptimizeIcon />}>
                            Optimize All
                        </Button>
                        <Button 
                            onClick={handleGenerateSheet} 
                            disabled={anyJobRunning || isLoading || driversLoading}
                            startIcon={isGeneratingSheet ? <LoaderIcon className="animate-spin" /> : <SheetIcon />}
                        >
                            Generate Picking Sheets
                        </Button>
                    </>
                )}
                {selectedPlanIds.length > 0 && (
                    <Button onClick={handleDeleteSelected} disabled={isDeleting || anyJobRunning} variant='danger' startIcon={isDeleting ? <LoaderIcon className="animate-spin" /> : <TrashBinIcon />}>
                        Delete ({selectedPlanIds.length}) Selected
                    </Button>
                )}
            </div>

            {/* Existing Job Status UIs (omitted for brevity) */}
            
            <div className="mt-4">
                {isLoading && (<div className="flex items-center justify-center p-8 text-gray-500"><LoaderIcon className="animate-spin mr-3 h-6 w-6" /><span>Loading plans...</span></div>)}
                {(error || queryError) && !isLoading && (<div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300" role="alert"><CloseIcon className="mr-3 w-5 h-5" /><div><span className="font-medium">Error:</span> {error || (queryError as any)?.data?.message || 'An error occurred'}</div></div>)}
                {!isLoading && !(error || queryError) && plans.length === 0 && (<div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg"><h3 className="text-lg font-medium text-gray-800 dark:text-white">No Plans Found</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no generated plans for this date.</p></div>)}

                {plans.length > 0 && !isLoading && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>{/* ... existing headers ... */}</TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan: Plan) => {
                                    const assignment = planAssignments[plan.planId];
                                    const segments = assignment?.segments || [];
                                    const rawSplits = assignment?.splits || [];
                                    
                                    const assignedCount = segments.filter(s => s.driverId > 0).length;
                                    
                                    const splitsDisplay = segments.length > 0 
                                        ? assignedCount > 0 ? `Sheets: ${segments.length} (${assignedCount} Assigned)` : `Sheets: ${segments.length} (Unassigned)`
                                        : rawSplits.length > 0 ? `Sheets: ${rawSplits.length + 1}` : 'Single Sheet';

                                    const isCurrentPlanFetching = isScheduleLoading && currentPlanToSplit?.planId === plan.planId;
                                    const buttonText = isCurrentPlanFetching ? 'Fetching Data...' : `Configure Sheets`;

                                    return (
                                        <TableRow key={plan.planId}>
                                            <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90 align-middle">
                                                <CheckboxCustom id={`select-${plan.planId}`} checked={selectedPlanIds.includes(plan.planId)} onChange={(e) => handleSelectOne(e, plan.planId)} />
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90 align-middle">{plan.routeId}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90 align-middle">{plan.planTitle}</TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90 align-middle">{plan.stopsAdded}</TableCell>
                                            
                                            {/* SPLIT CONFIGURATION CELL */}
                                            <TableCell className="px-5 py-4 text-start align-middle">
                                                <Button 
                                                    onClick={() => handleOpenSplitModal(plan)}
                                                    size='sm'
                                                    startIcon={isCurrentPlanFetching ? <LoaderIcon className="animate-spin" /> : <PencilIcon />}
                                                    disabled={isCurrentPlanFetching || anyJobRunning || driversLoading || plan.stopsAdded < 2}
                                                >
                                                    {buttonText}
                                                </Button>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {isCurrentPlanFetching ? 'Fetching data...' : splitsDisplay}
                                                </p>
                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90 align-middle"><a href={plan.planUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Plan</a></TableCell>
                                        </TableRow>
                                    )}
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
            
            {/* Split Configuration Modal - Only render when data is ready */}
            {isModalReady && (
                <SplitConfigurationModal
                    plan={currentPlanToSplit!}
                    currentSplits={planAssignments[currentPlanToSplit!.planId]?.splits || []}
                    currentSegments={planAssignments[currentPlanToSplit!.planId]?.segments || []} 
                    drivers={drivers}     
                    driverAssignmentCounts={driverAssignmentCounts}                   
                    onSave={handleSaveAssignment}
                    onClose={handleCloseModal}
                    scheduleData={modalScheduleData} 
                    isLoading={false} 
                    error={scheduleError}
                />
            )}
        </div>
    );
}