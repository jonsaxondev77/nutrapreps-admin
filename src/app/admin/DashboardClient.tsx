"use client";
import React from "react";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useGetDashboardDataQuery } from "@/lib/services/dashboardApi";
import { DashboardSkeleton } from "@/components/ecommerce/Skeletons";
import ErrorAlert from "@/components/common/ErrorAlert";


export default function DashboardClient() {
    const { data, isLoading, error } = useGetDashboardDataQuery();

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <ErrorAlert error={error} title="Failed to Load Dashboard" />;
    }
    
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics stats={data.stats} />
                <MonthlySalesChart />
            </div>
            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget stats={data.stats} />
            </div>
            <div className="col-span-12">
                <StatisticsChart />
            </div>
            <div className="col-span-12 xl:col-span-5">
                <DemographicCard recentUsers={data.recentUsers} />
            </div>
            <div className="col-span-12 xl:col-span-7">
                <RecentOrders recentOrders={data.recentOrders} />
            </div>
        </div>
    );
}