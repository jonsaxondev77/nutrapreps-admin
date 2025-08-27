import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithRedirect } from "./baseQuery";

interface MealOption {
  id: number;
  name: string;
  isAddon: boolean;
  mealId: number;
  meal: {
    id: number;
    name: string;
  }
}

interface PaginatedMealOptions {
  data: MealOption[];
  totalPages: number;
}

export const mealOptionsApi = createApi({
  reducerPath: "mealOptionsApi",
  baseQuery: baseQueryWithRedirect,
  tagTypes: ["MealOptions"],
  endpoints: (builder) => ({
    getAllMealOptions: builder.query<PaginatedMealOptions, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `mealoptions?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["MealOptions"],
    }),
    createMealOption: builder.mutation<void, Omit<MealOption, 'id' | 'meal'>>({
        query: (mealOption) => ({
            url: 'mealoptions',
            method: 'POST',
            body: mealOption
        }),
        invalidatesTags: ['MealOptions']
    }),
    updateMealOption: builder.mutation<void, Omit<MealOption, 'meal'>>({
        query: (mealOption) => ({
            url: `mealoptions`,
            method: 'PUT',
            body: mealOption
        }),
        invalidatesTags: ['MealOptions']
    }),
    deleteMealOption: builder.mutation<void, number>({
        query: (id) => ({
            url: `mealoptions/${id}`,
            method: 'DELETE'
        }),
        invalidatesTags: ['MealOptions']
    })
  }),
});

export const { 
    useGetAllMealOptionsQuery, 
    useCreateMealOptionMutation, 
    useUpdateMealOptionMutation, 
    useDeleteMealOptionMutation 
} = mealOptionsApi;