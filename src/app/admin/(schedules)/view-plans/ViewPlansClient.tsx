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
    PlanToGenerate 
} from '@/lib/services/schedulerApi';
import { LoaderIcon, OptimizeIcon, SheetIcon, TrashBinIcon, CloseIcon, PencilIcon } from '@/icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import DatePickerCustom from '@/components/form/date-picker-custom';
import CheckboxCustom from '@/components/form/input/CheckboxCustom';

// Ensure this path and import match your actual SplitConfigurationModal.tsx file
import SplitConfigurationModal from './SplitConfigurationModal'; 

// Define the assumed types necessary for compilation and logic
interface ScheduleDetail {
    stopPosition: number;
    name: string;
    address_Line1: string;
    // Add other relevant fields if necessary
}
interface Plan {
    planId: string;
    planTitle: string;
    stopsAdded: number;
    routeId: string;
    planUrl: string;
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


export default function ViewPlansClient({downloadApiUrl } : { downloadApiUrl: string}) {
    const searchParams = useSearchParams();
    const dateFromUrl = searchParams.get('date');
    
    const [selectedDate, setSelectedDate] = useState<Date>(() => getInitialDate(dateFromUrl));
    const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [splitPoints, setSplitPoints] = useState<Record<string, number[]>>({});

    // isSplitModalOpen state is removed, relying on currentPlanToSplit and modalScheduleData
    const [currentPlanToSplit, setCurrentPlanToSplit] = useState<Plan | null>(null);
    
    // NEW STATE: Used for the job that fetches the schedule data for the modal
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

    // HANDLER for updating the split points from the modal
    const handleSaveSplitPoints = (planId: string, points: number[]) => {
        setSplitPoints(prev => ({ ...prev, [planId]: points.sort((a, b) => a - b) }));
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

        const interval = setInterval(poll, 3000);
        
        return () => clearInterval(interval);
    }, [modalScheduleJobId, triggerGetJobStatus]);


    // Polling Effect for Modal Schedule Data
    useEffect(() => {
        if (modalScheduleJobId) {
            const cleanup = createPoll(
                modalScheduleJobId,
                true, // We are actively polling for the schedule job
                setIsScheduleLoading,
                (p) => {}, // No progress for this job
                setScheduleError,
                setModalScheduleJobId,
                (jobId, jobData) => {
                    if (jobData?.result) {
                        try {
                            const schedules: ScheduleDetail[] = JSON.parse(jobData.result);
                            setModalScheduleData(schedules);
                        } catch (e) {
                            setScheduleError("Failed to parse schedule data from job result.");
                        }
                    } else if (jobData?.status === 'Failed') {
                        setScheduleError(jobData.message || "Schedule data job failed on the server.");
                    } else {
                         setScheduleError("Schedule data job completed but returned no result.");
                    }
                    setIsScheduleLoading(false); // Job is finished, loading stops
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


    // RESTORED HANDLERS: handleOptimizePlans, handleGenerateSheet, handleDeleteSelected
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

    const handleGenerateSheet = async () => {
        setIsGeneratingSheet(true);
        setSheetStatusMessage("Submitting sheet generation job...");
        try {
            const plansToGenerate: PlanToGenerate[] = plans.map((plan: Plan) => ({
                planId: plan.planId,
                splitStops: splitPoints[plan.planId] || [], 
            }));

            const body = { 
                plans: plansToGenerate, 
                date: formatDateForApi(selectedDate) 
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
                        <Button onClick={handleGenerateSheet} disabled={anyJobRunning || isLoading} startIcon={isGeneratingSheet ? <LoaderIcon className="animate-spin" /> : <SheetIcon />}>
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

            {/* Existing Job Status UI (Optimization/Sheet Generation) */}
            {isOptimizing && (
                <div className="my-4 p-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900 dark:text-purple-300">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium">{optimizationStatusMessage || 'Optimizing...'}</span>
                        <span className="text-sm font-medium">{optimizationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${optimizationProgress}%` }}></div>
                    </div>
                </div>
            )}
            {isGeneratingSheet && (
                <div className="my-4 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900 dark:text-blue-300">
                     <div className="flex justify-between mb-1">
                        <span className="text-base font-medium">{sheetStatusMessage || 'Generating...'}</span>
                        <span className="text-sm font-medium">{sheetProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${sheetProgress}%` }}></div>
                    </div>
                </div>
            )}
            
            {/* Custom alert-style loading bar for schedule data fetching */}
            {isScheduleLoading && currentPlanToSplit && (
                <div className="my-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium">{scheduleError ? 'Loading failed' : `Loading schedule data for ${currentPlanToSplit.planTitle}...`}</span>
                        <span className="text-sm font-medium">{scheduleError ? 'Failed' : 'Running'}</span>
                    </div>
                    {scheduleError ? (
                            <div className="text-red-500 text-sm">{scheduleError}</div>
                    ) : (
                        <div className="w-full h-4 flex items-center">
                            Processing stops...
                        </div>
                    )}
                </div>
            )}


            <div className="mt-4">
                {isLoading && (<div className="flex items-center justify-center p-8 text-gray-500"><LoaderIcon className="animate-spin mr-3 h-6 w-6" /><span>Loading plans...</span></div>)}
                {(error || queryError) && !isLoading && (<div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300" role="alert"><CloseIcon className="mr-3 w-5 h-5" /><div><span className="font-medium">Error:</span> {error || (queryError as any)?.data?.message || 'An error occurred'}</div></div>)}
                {!isLoading && !(error || queryError) && plans.length === 0 && (<div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg"><h3 className="text-lg font-medium text-gray-800 dark:text-white">No Plans Found</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no generated plans for this date.</p></div>)}

                {plans.length > 0 && !isLoading && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        <CheckboxCustom id='select-all' checked={isAllSelected} onChange={handleSelectAll} />
                                    </TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Route ID</TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Plan Title</TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Stops Added</TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Picking Splits</TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">View in Circuit</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan: Plan) => {
                                    const splits = splitPoints[plan.planId] || [];
                                    const numSheets = splits.length + 1;
                                    const splitsDisplay = splits.length > 0 
                                        ? `Sheets: ${numSheets}`
                                        : 'Single Sheet';

                                    // Check if THIS SPECIFIC plan is the one currently fetching data
                                    const isCurrentPlanFetching = isScheduleLoading && currentPlanToSplit?.planId === plan.planId;
                                    const buttonText = isCurrentPlanFetching ? 'Fetching Data...' : `Configure (${numSheets} Sheets)`;

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
                                                    startIcon={isCurrentPlanFetching ? <LoaderIcon size={16} className="animate-spin" /> : <PencilIcon size={16} />}
                                                    disabled={isCurrentPlanFetching || anyJobRunning || plan.stopsAdded < 2}
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
                    currentSplits={splitPoints[currentPlanToSplit!.planId] || []}
                    onSave={handleSaveSplitPoints}
                    onClose={handleCloseModal}
                    scheduleData={modalScheduleData} 
                    isLoading={false} 
                    error={scheduleError}
                />
            )}
        </div>
    );
}