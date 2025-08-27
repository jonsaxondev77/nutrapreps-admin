// src/lib/services/mealsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithRedirect } from "./baseQuery";


interface MealListItem {
  id: number;
  name: string;
}

interface Meal {
  id: number;
  name: string;
  description: string;
  fat: string;
  carbs: string;
  protein: string;
  calories: string;
  allergies: string | null;
  supplement: number | null;
  stripeProductId?: string | null;
}

interface PaginatedMeals {
  data: Meal[];
  totalPages: number;
}

export const mealsApi = createApi({
  reducerPath: "mealsApi",
  baseQuery: baseQueryWithRedirect,
  tagTypes: ["Meals"],
  endpoints: (builder) => ({
    getAllMeals: builder.query<PaginatedMeals, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `meals?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Meals"],
    }),
    getAllMealsList: builder.query<MealListItem[], void>({
        query: () => `meals/all`,
    }),
    createMeal: builder.mutation<void, Omit<Meal, 'id'>>({
        query: (meal) => ({
            url: 'meals',
            method: 'POST',
            body: meal
        }),
        invalidatesTags: ['Meals']
    }),
    updateMeal: builder.mutation<void, Meal>({
        query: (meal) => ({
            url: `meals`,
            method: 'PUT',
            body: meal
        }),
        invalidatesTags: ['Meals']
    }),
    deleteMeal: builder.mutation<void, number>({
        query: (id) => ({
            url: `meals/${id}`,
            method: 'DELETE'
        }),
        invalidatesTags: ['Meals']
    })
  }),
});

export const { useGetAllMealsQuery, useGetAllMealsListQuery, useCreateMealMutation, useUpdateMealMutation, useDeleteMealMutation } = mealsApi;