"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

import { format, addHours, isBefore, isEqual } from 'date-fns';
import { useGetKqlDataQuery } from "@/lib/services/telemetryApi";

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface KqlTimeChartProps {
    kqlQuery: string;
    title: string;
    additionalOptions?: object;
}

const fillMissingData = (rows: any[]) => {
    if (rows.length === 0) return [];
    
    const sortedRows = rows.slice().sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    const filledData = [];
    const startTime = new Date(sortedRows[0][0]);
    const endTime = new Date(sortedRows[sortedRows.length - 1][0]);
    let currentTime = startTime;
    let rowIndex = 0;

    while (isBefore(currentTime, endTime) || isEqual(currentTime, endTime)) {
        const rowTime = rowIndex < sortedRows.length ? new Date(sortedRows[rowIndex][0]) : null;

        if (rowTime && isEqual(currentTime, rowTime)) {
            filledData.push({ x: rowTime, y: sortedRows[rowIndex][1] });
            rowIndex++;
        } else {
            filledData.push({ x: currentTime, y: 0 });
        }
        currentTime = addHours(currentTime, 1);
    }
    
    return filledData;
};

const getChartOptions = (title: string, isDarkMode: boolean) => ({
    chart: {
        id: title.replace(/\s/g, "-"),
        type: 'line',
        toolbar: { show: false },
        background: isDarkMode ? '#1f2937' : '#ffffff',
    },
    title: {
        text: title,
        align: 'left',
        style: {
            color: isDarkMode ? '#f9fafb' : '#111827',
        },
    },
    xaxis: {
        type: 'datetime' as const,
        labels: {
            formatter: (value: string) => format(new Date(value), 'HH:mm'),
        },
    },
    tooltip: {
        x: {
            format: 'dd MMM yyyy HH:mm'
        }
    },
    dataLabels: {
        enabled: false,
    },
});

const KqlTimeChart: React.FC<KqlTimeChartProps> = ({ kqlQuery, title, additionalOptions }) => {
    const { data, error, isLoading } = useGetKqlDataQuery({ kqlQuery });
    
    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-80">
                <span className="text-gray-500 dark:text-gray-400">Loading chart... ⏳</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-80">
                <span className="text-red-500 dark:text-red-400">Error: {(error as any).data?.error || "Failed to fetch data"} 💔</span>
            </div>
        );
    }

    if (!data || !data.tables || data.tables.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-80">
                <span className="text-gray-500 dark:text-gray-400">No data available. 📊</span>
            </div>
        );
    }

    const rows = data.tables[0].rows;
    const filledData = fillMissingData(rows);
    
    const series = [{
        name: "Count",
        data: filledData,
    }];
    
    const options = { ...getChartOptions(title, isDarkMode), ...additionalOptions };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <ApexChart
                options={options}
                series={series}
                type="line"
                height={350}
            />
        </div>
    );
};

export default KqlTimeChart;