import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface MealOption {
  id: string;
  name: string;
  description: string;
  meal: any
}

interface PaginatedMealOptions {
  data: MealOption[];
  totalPages: number;
}

export const mealOptionsApi = createApi({
  reducerPath: "mealOptionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5265/" }), // Adjust if your backend URL is different
  endpoints: (builder) => ({
    getAllMealOptions: builder.query<PaginatedMealOptions, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `mealoptions?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    }),
  }),
});

export const { useGetAllMealOptionsQuery } = mealOptionsApi;