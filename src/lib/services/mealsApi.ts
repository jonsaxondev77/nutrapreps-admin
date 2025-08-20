// src/lib/services/mealsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Meal {
  id: string;
  name: string;
  description: string;
}

interface PaginatedMeals {
  data: Meal[];
  totalPages: number;
}

export const mealsApi = createApi({
  reducerPath: "mealsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5265/" }), // Adjust if your backend URL is different
  endpoints: (builder) => ({
    getAllMeals: builder.query<PaginatedMeals, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `meals?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    }),
  }),
});

export const { useGetAllMealsQuery } = mealsApi;