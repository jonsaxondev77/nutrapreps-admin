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
    // Import the types for the updated mutation signature
    Plan, 
    PlanToGenerate 
} from '@/lib/services/schedulerApi';
import { LoaderIcon, OptimizeIcon, SheetIcon, TrashBinIcon, CloseIcon } from '@/icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import DatePickerCustom from '@/components/form/date-picker-custom';
import CheckboxCustom from '@/components/form/input/CheckboxCustom';

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


export default function ViewPlansClient({downloadApiUrl } :  { downloadApiUrl: string}) {
    const searchParams = useSearchParams();
    const dateFromUrl = searchParams.get('date');
    
    const [selectedDate, setSelectedDate] = useState<Date>(() => getInitialDate(dateFromUrl));
    const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // STATE: To store the target drops per sheet.
    const [splitStops, setSplitStops] = useState<Record<string, number>>({});

    // API Hooks
    const { data: plans = [], error: queryError, isLoading, refetch } = useGetPlansByDateQuery({ date: formatDateForApi(selectedDate) });
    const [deletePlans, { isLoading: isDeleting }] = useDeletePlansMutation();
    const [optimizePlans, { isLoading: isSubmittingOptimization }] = useOptimizePlansMutation();
    const [generateSheet, { isLoading: isSubmittingSheet }] = useGenerateSheetMutation();
    const [triggerGetJobStatus] = useLazyGetJobStatusQuery();

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

    // Generic polling logic (wrapped in useCallback for dependency stability)
    const createPoll = useCallback((
        jobId: string | null,
        isPolling: boolean,
        setIsPolling: (isPolling: boolean) => void,
        setProgress: (progress: number) => void,
        setMessage: (message: string) => void,
        setJobId: (jobId: string | null) => void,
        onComplete?: (jobId: string) => void
    ) => {
        if (!jobId || !isPolling) return;

        const poll = async () => {
            const { data, isError, error: pollError } = await triggerGetJobStatus(jobId, false);
            if (isError || !data) {
                setError((pollError as any)?.data?.message || "Polling failed.");
                setIsPolling(false);
                return;
            }

            setProgress(data.progress);
            setMessage(data.message);

            if (data.status === 'Completed' || data.status === 'Failed') {
                setIsPolling(false);
                setJobId(null);
                if (data.status === 'Failed') {
                    setError(data.message);
                } else {
                    onComplete?.(jobId);
                }
            }
        };

        const interval = setInterval(poll, 3000);
        
        if (isOptimizing) optimizationPollingRef.current = interval;
        if (isGeneratingSheet) sheetPollingRef.current = interval;

        return () => clearInterval(interval);
    }, [isOptimizing, isGeneratingSheet, triggerGetJobStatus]);

    // UseEffect logic
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

    const handleSplitStopsChange = (planId: string, stops: number, maxStops: number) => {
        const value = Math.min(Math.max(0, stops), maxStops);
        setSplitStops(prev => ({ ...prev, [planId]: value }));
    };


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
                splitStops: splitStops[plan.planId] || 0, 
            }));
            
            const body = { 
                plans: plansToGenerate, 
                date: formatDateForApi(selectedDate) 
            };

            const result = await generateSheet(body).unwrap();
            setSheetJobId(result.jobId);
        } catch (e) {
            console.log(e);
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
                            Generate Spreadsheet
                        </Button>
                    </>
                )}
                {selectedPlanIds.length > 0 && (
                    <Button onClick={handleDeleteSelected} disabled={isDeleting || anyJobRunning} variant='danger' startIcon={isDeleting ? <LoaderIcon className="animate-spin" /> : <TrashBinIcon />}>
                        Delete ({selectedPlanIds.length}) Selected
                    </Button>
                )}
            </div>

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
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Max Drops Per Sheet</TableCell>
                                    <TableCell isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">View in Circuit</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan) => {
                                    const N = splitStops[plan.planId] || 0;
                                    const T = plan.stopsAdded;
                                    const totalSheets = N > 0 ? Math.ceil(T / N) : 1;
                                    const lastSheetDrops = N > 0 ? ((T % N) || N) : T;
                                    return (
                                    
                                    <TableRow key={plan.planId}>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                                            <CheckboxCustom id={`select-${plan.planId}`} checked={selectedPlanIds.includes(plan.planId)} onChange={(e) => handleSelectOne(e, plan.planId)} />
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{plan.routeId}</TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{plan.planTitle}</TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{plan.stopsAdded}</TableCell>
                                        <TableCell className="px-5 py-4 text-start align-middle">
                                            {/* Input field for Max Drops Per Sheet (Chunk Size) */}
                                            <input
                                                type="number"
                                                min={20}
                                                max={plan.stopsAdded} 
                                                value={N}
                                                onChange={(e) => handleSplitStopsChange(plan.planId, Number(e.target.value), plan.stopsAdded)}
                                                // w-20 and py-1 keeps the element compact and centered vertically
                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white w-20 text-center"
                                                title={`Enter the maximum drops per sheet (0 for one sheet). Max: ${plan.stopsAdded}.`}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    { N > 0 && N < T &&
                                                        `Results in ${totalSheets} sheets (last sheet: ${lastSheetDrops} drops).`
                                                    }
                                                    { (N >= T && T > 0) && `Will generate 1 sheet (${T} drops).` }
                                                    { N === 0 && `Default: 1 sheet.` }
                                                </p>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90"><a href={plan.planUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Plan</a></TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}