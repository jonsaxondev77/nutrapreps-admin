// src/lib/services/pagesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithRedirect } from "./baseQuery";

interface Page {
  path: string;
  title: string;
  updatedAt: string;
}

export const pagesApi = createApi({
  reducerPath: "pagesApi",
  baseQuery: baseQueryWithRedirect,
  endpoints: (builder) => ({
    getAllPages: builder.query<Page[], void>({
      query: () => `pages/all`,
    }),
  }),
});

export const { useGetAllPagesQuery } = pagesApi;