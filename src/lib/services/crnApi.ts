// src/lib/services/crmApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRedirect } from './baseQuery';
import { CrmDashboardDto } from '@/types/crm';


export const crmApi = createApi({
  reducerPath: 'crmApi',
  baseQuery: baseQueryWithRedirect,
  endpoints: (builder) => ({
    getCrmData: builder.query<CrmDashboardDto, void>({ // Use the new type here
      query: () => 'crm/data',
    }),
  }),
});

export const { useGetCrmDataQuery } = crmApi;