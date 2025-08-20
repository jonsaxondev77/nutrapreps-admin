// src/lib/services/pagesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Page {
  path: string;
  title: string;
  updatedAt: string;
}

export const pagesApi = createApi({
  reducerPath: "pagesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5265/" }), // Adjust the base URL to your backend's address
  endpoints: (builder) => ({
    getAllPages: builder.query<Page[], void>({
      query: () => `pages/all`,
    }),
  }),
});

export const { useGetAllPagesQuery } = pagesApi;