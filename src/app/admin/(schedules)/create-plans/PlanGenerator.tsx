// In: src/app/admin/(schedules)/create-plans/page.tsx

"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button/Button';
import { useGeneratePlansMutation, useLazyGetJobStatusQuery } from '@/lib/services/schedulerApi';
import { CheckCircleIcon, CloseIcon, LoaderIcon } from '@/icons';
import DatePickerCustom from '@/components/form/date-picker-custom';

// Helper function to find the next valid day (Wednesday or Sunday)
const getInitialValidDate = () => {
    let date = new Date();
    while (date.getDay() !== 0 && date.getDay() !== 3) {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

// Helper function to format a Date object into YYYY-MM-DD string without timezone conversion
const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function PlanGenerator() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date>(getInitialValidDate());
    const [jobId, setJobId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Select a date and click "Generate" to begin.');
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [generatePlans, { isLoading: isGenerating }] = useGeneratePlansMutation();
    const [triggerGetJobStatus] = useLazyGetJobStatusQuery();

    const handleApiError = (err: any) => {
        const errorMessage =
            err?.data?.message ||
            err?.message ||
            (typeof err === 'string' ? err : 'An unknown error occurred.');
        setError(errorMessage);
        setIsProcessing(false);
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };

    const pollStatus = useCallback(async () => {
        if (!jobId) {
            return;
        }
        try {
            const { data, isError, error: jobError } = await triggerGetJobStatus(jobId, false);

            if (isError || !data) {
                throw jobError || new Error('Failed to get job status.');
            }

            setProgress(data.progress);
            setStatusMessage(data.message);

            if (data.status === 'Completed' || data.status === 'Failed') {
                setIsProcessing(false);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setJobId(null);

                if (data.status === 'Completed') {
                    setIsComplete(true);
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            handleApiError(err);
        }
    }, [jobId, triggerGetJobStatus]);

    useEffect(() => {
        if (jobId && isProcessing) {
            pollingIntervalRef.current = setInterval(pollStatus, 3000);
        }
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [jobId, isProcessing, pollStatus]);

    const handleGeneratePlans = async () => {
        setIsProcessing(true);
        setJobId(null);
        setError(null);
        setIsComplete(false);
        setProgress(0);
        setStatusMessage("Submitting job to the server...");

        try {
            const dateString = formatDateForApi(selectedDate);
            const result = await generatePlans({ date: dateString }).unwrap();
            setJobId(result.jobId);
            setStatusMessage("Job started! Waiting for progress updates...");
        } catch (err) {
            handleApiError(err);
        }
    };

    const handleViewPlans = () => {
        const dateString = formatDateForApi(selectedDate);
        router.push(`/admin/view-plans?date=${dateString}`);
    };

    const isLoading = isProcessing || isGenerating;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Generate Delivery Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Select a date to fetch schedules, group them by route, and create plans in Circuit.</p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <DatePickerCustom
                    id="plan-date-picker"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date as Date)}
                    enableSundaysAndWednesdays={true}
                />
                <Button onClick={handleGeneratePlans} disabled={isLoading} startIcon={isLoading ? <LoaderIcon className="animate-spin" /> : undefined}>
                    {isLoading ? "Processing..." : "Generate Plans"}
                </Button>
            </div>

            <div className="mt-8">
                {isLoading && (
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-blue-700 dark:text-blue-400">{statusMessage}</span>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex items-center p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300" role="alert">
                        <CloseIcon className="flex-shrink-0 inline w-5 h-5 mr-3" />
                        <div><span className="font-medium">Error:</span> {error}</div>
                    </div>
                )}

                {isComplete && !isLoading && !error && (
                    <div className="flex items-center justify-between p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900 dark:text-green-300" role="alert">
                        <div className="flex items-center">
                            <CheckCircleIcon className="flex-shrink-0 inline w-5 h-5 mr-3" />
                            <div>
                                <span className="font-medium">Success!</span> {statusMessage}
                            </div>
                        </div>
                        <Button onClick={handleViewPlans} size="sm">
                            View Plans for this Date
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}