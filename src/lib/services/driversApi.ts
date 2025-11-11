
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRedirect } from './baseQuery'; 
import { PagedResponse } from '@/types/global'; 
import { 
  Driver, 
  DriverCreateRequest, 
  DriverUpdateRequest 
} from '@/types/drivers';


// Define the structure for the query parameters inline
interface DriverQueryParameters {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export const driversApi = createApi({
  reducerPath: 'driversApi',
  baseQuery: baseQueryWithRedirect, 
  tagTypes: ['Driver'],
  endpoints: (builder) => ({
    
    // GET: api/Drivers?pageNumber=X&pageSize=Y&search=Z
    getDrivers: builder.query<PagedResponse<Driver>, DriverQueryParameters>({
      query: ({ pageNumber, pageSize, search }) => {
        let url = 'Drivers';
        const params = new URLSearchParams();

        params.append('pageNumber', pageNumber.toString());
        params.append('pageSize', pageSize.toString());

        if (search) {
          params.append('search', search); 
        }

        return `${url}?${params.toString()}`;
      },
      providesTags: ["Driver"], 
    }),
    
    // GET: api/Drivers/5
    getDriverById: builder.query<Driver, number>({
        query: (id) => `Drivers/${id}`,
        providesTags: (result, error, id) => [{ type: 'Driver', id }],
    }),

    // POST: api/Drivers
    createDriver: builder.mutation<Driver, DriverCreateRequest>({
      query: (newDriver) => ({ url: 'Drivers', method: 'POST', body: newDriver }),
      invalidatesTags: ['Driver'], 
    }),

    // PUT: api/Drivers/5
    updateDriver: builder.mutation<Driver, { id: number; data: DriverUpdateRequest }>({
      query: ({ id, data }) => ({ url: `Drivers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Driver'],
    }),

    // DELETE: api/Drivers/5
    deleteDriver: builder.mutation<void, number>({
      query: (id) => ({ url: `Drivers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Driver'],
    }),
  }),
});

export const {
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
  useDeleteDriverMutation,
} = driversApi;