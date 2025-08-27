import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithRedirect } from "./baseQuery";

// --- Interfaces for the API responses ---
interface Plan {
    routeId: number;
    planId: string;
    planTitle: string;
    stopsAdded: number;
    planUrl: string;
}

interface GeneratePlansResponse {
    jobId: string;
}

interface JobStatusResponse {
    status: 'Pending' | 'Running' | 'Completed' | 'Failed';
    progress: number;
    message: string;
}

const API_BASE_URL = "http://localhost:5265/";

export const schedulerApi = createApi({
  reducerPath: "schedulerApi",
  baseQuery: baseQueryWithRedirect,
  tagTypes: ["Plans"],
  endpoints: (builder) => ({
    getPlansByDate: builder.query<Plan[], { date: string }>({
        query: ({ date }) => `api/routing/plans-by-date?date=${date}`,
        providesTags: (result, error, { date }) => [{ type: 'Plans', id: date }],
    }),
    generatePlans: builder.mutation<GeneratePlansResponse, { date: string }>({
        query: ({ date }) => ({
            url: `api/jobs/generate-plans?date=${date}`,
            method: 'POST',
        }),
    }),
    optimizePlans: builder.mutation<GeneratePlansResponse, string[]>({
        query: (planIds) => ({
            url: `api/jobs/optimize-plans`,
            method: 'POST',
            body: planIds,
        }),
    }),
    generateSheet: builder.mutation<GeneratePlansResponse, { planIds: string[], date: string }>({
        query: (body) => ({
            url: `api/jobs/generate-sheet`,
            method: 'POST',
            body: body,
        }),
    }),
    deletePlans: builder.mutation<void, string[]>({
        query: (planIds) => ({
            url: `api/routing/delete-plans`,
            method: 'DELETE',
            body: planIds
        }),
        invalidatesTags: ['Plans'],
    }),
    getJobStatus: builder.query<JobStatusResponse, string>({
        query: (jobId) => `api/jobs/${jobId}`,
        keepUnusedDataFor: 0,
    }),
  }),
});

export const { 
    useGetPlansByDateQuery,
    useGeneratePlansMutation,
    useOptimizePlansMutation,
    useGenerateSheetMutation,
    useDeletePlansMutation,
    useLazyGetJobStatusQuery,
} = schedulerApi;