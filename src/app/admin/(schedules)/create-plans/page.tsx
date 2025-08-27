"use client";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PlanGenerator from "./PlanGenerator";

export default function CreatePlansPage() {
    return (
        <>
            <PageBreadcrumb pageTitle="Create Plans" />
            <PlanGenerator />
        </>
    );
}