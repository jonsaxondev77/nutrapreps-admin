"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ViewPlansClient from "./ViewPlansClient";

export default function ViewPlansPage() {
    return (
        <>
            <PageBreadcrumb pageTitle="View & Manage Plans" />
            <ViewPlansClient />
        </>
    );
}