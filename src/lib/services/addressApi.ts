import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithRedirect } from './baseQuery';

// Basic types for address.io response
interface Suggestion {
  address: string;
  url: string;
  id: string;
}

interface AddressDetails {
  postcode: string;
  line_1: string;
  line_2: string;
  line_3: string;
  town_or_city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const addressApi = createApi({
  reducerPath: 'addressApi',
  baseQuery: baseQueryWithRedirect,
  endpoints: (builder) => ({
    autocompleteAddress: builder.query<Suggestion[], string>({
      query: (term) => `addresslookup/autocomplete/${term}`,
    }),
    getAddressDetails: builder.query<AddressDetails, string>({
      query: (id) => `addresslookup/get/${id}`,
    }),
  }),
});

export const { useLazyAutocompleteAddressQuery, useLazyGetAddressDetailsQuery } = addressApi;