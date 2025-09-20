"use client";
import KqlBarChart from "@/components/charts/bar/KqlBarChart";
import KqlPieChart from "@/components/charts/pie/KqlPieChart";
import KqlTimeChart from "@/components/charts/time/KqlTimeChart";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import React from 'react';

export default function TelemetryDashboardPage() {

    const userRegistrationFunnel = `customEvents 
| where name in ("RegistrationFailed", "UserRegistered", "EmailConfirmationSent", "EmailVerificationFailed", "EmailVerificationSuccessful")
| summarize count() by name 
| order by name
| render columnchart `;

    const passwordResetFunnel = `customEvents
| where name in ("PasswordResetSuccessful", "PasswordResetFailed", "PasswordResetRequested")
| summarize count() by name
| render piechart`;

    const loginFailedAttempts = `customEvents
| where name == "LoginFailed"
| summarize count() by bin(timestamp, 1h)
| render timechart`;

    const ordersPlacedOverTime = `customEvents
| where name == "OrderPlaced"
| summarize count() by bin(timestamp, 1d)
| render timechart`;

    const totalRevenueOverTime = `customEvents
| where name == "OrderPlaced"
| extend orderTotal = todouble(customMeasurements.OrderTotal)
| summarize sum(orderTotal) by bin(timestamp, 1d)
| render timechart`

    const successfulVsFailedLogins = `customEvents | where name == "LoginSuccessful" or name == "LoginFailed" | summarize count() by name | render piechart`;

    return (
        <>
            <PageBreadcrumb pageTitle="Telemetry Dashboard" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12">
                    <KqlBarChart
                        kqlQuery={userRegistrationFunnel}
                        title="User Registration Funnel" />
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <KqlPieChart
                        kqlQuery={passwordResetFunnel}
                        title="Password Reset Funnel"
                        additionalOptions={{
                            colors: ['#3B82F6', '#22C55E', '#EF4444']
                        }} />
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <KqlTimeChart kqlQuery={loginFailedAttempts} title="Login Failed Attempts" />
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <KqlTimeChart 
                        kqlQuery={ordersPlacedOverTime} 
                        title="Orders Placed Over Time"
                        additionalOptions={{
                             xaxis: {
                               labels: {
                                   formatter: (value: string) => {
                                       const date = new Date(value);
                                       return date.getDate().toString();
                                   }
                               }
                           }
                        }} />
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <KqlTimeChart 
                        kqlQuery={totalRevenueOverTime} 
                        title="Total Revenue Over Time"
                        additionalOptions={{
                           tooltip: {
                               y: {
                                   formatter: (value: number) => {
                                       if (value === null) return 'N/A';
                                       return `£${value.toFixed(2)}`;
                                   }
                               }
                           },
                           yaxis: {
                               labels: {
                                   formatter: (value: number) => `£${value.toFixed(2)}`
                               }
                           },
                           xaxis: {
                               labels: {
                                   formatter: (value: string) => {
                                       const date = new Date(value);
                                       return date.getDate().toString();
                                   }
                               }
                           }
                       }} />
                </div>
                <div className="col-span-12 xl:col-span-6">
                    <KqlPieChart
                        kqlQuery={successfulVsFailedLogins}
                        title="Successful vs Failed Login"
                        additionalOptions={{
                            colors: [ '#22C55E', '#EF4444']
                        }} />
                </div>
            </div>
        </>
    );
}
