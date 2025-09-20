"use client";
import React, { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

import { format, addHours, isBefore, isEqual } from 'date-fns';
import { useGetKqlDataQuery } from "@/lib/services/telemetryApi";

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface KqlPieChartProps {
    kqlQuery: string;
    title: string;
    additionalOptions?: object;
}

const getPieChartOptions = (title: string, isDarkMode: boolean) => ({
    chart: {
        id: title.replace(/\s/g, "-"),
        type: 'pie',
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
    legend: {
        position: 'bottom',
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
});

const KqlPieChart: React.FC<KqlPieChartProps> = ({ kqlQuery, title, additionalOptions }) => {
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

    if (!data || !data.tables || data.tables.length === 0 || data.tables[0].rows.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-center h-80">
                <span className="text-gray-500 dark:text-gray-400">No data available. 📊</span>
            </div>
        );
    }

    const rows = data.tables[0].rows;
    const series = rows.map((row: any) => row[1]);
    const options = {
        ...getPieChartOptions(title, isDarkMode),
        labels: rows.map((row: any) => row[0]),
        ...additionalOptions
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <ApexChart
                options={options}
                series={series}
                type="pie"
                height={350}
            />
        </div>
    );
};

export default KqlPieChart;