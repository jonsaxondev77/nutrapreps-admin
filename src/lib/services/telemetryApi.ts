import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRedirect } from './baseQuery';

// Create a new base query specifically for the Azure Monitor API proxy
const telemetryBaseQuery = fetchBaseQuery({
  baseUrl: '/api/azure-monitor',
});

export const telemetryApi = createApi({
  reducerPath: 'telemetryApi',
  baseQuery: telemetryBaseQuery,
  endpoints: (builder) => ({
    getKqlData: builder.query<any, { kqlQuery: string }>({
      query: ({ kqlQuery }) => ({
        url: 'query',
        method: 'POST',
        body: { kqlQuery },
      }),
    }),
  }),
});

export const { useGetKqlDataQuery } = telemetryApi;
