import React, { Suspense } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ViewPlansClient from "./ViewPlansClient";

export default function ViewPlansPage() {

    const downloadApiUrl = process.env.API_URL || "https://apinutrapreps.azurewebsites.net";

    console.log(downloadApiUrl);

    return (
        <>
            <Suspense>
                <PageBreadcrumb pageTitle="View & Manage Plans" />
                <ViewPlansClient downloadApiUrl={downloadApiUrl} />
            </Suspense>
        </>
    );
}