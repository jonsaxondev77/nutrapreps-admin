"use client";
import React, { Suspense } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ViewPlansClient from "./ViewPlansClient";

export default function ViewPlansPage() {
    return (
        <>
            <Suspense>
                <PageBreadcrumb pageTitle="View & Manage Plans" />
                <ViewPlansClient />
            </Suspense>
        </>
    );
}