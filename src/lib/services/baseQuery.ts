import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession, signOut } from 'next-auth/react';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();

const baseQuery = fetchBaseQuery({
  baseUrl: serverRuntimeConfig.apiUrl,
  prepareHeaders: async (headers) => {
    const session = await getSession();
    if (session?.user.jwtToken) {
      headers.set('Authorization', `Bearer ${session.user.jwtToken}`);
    }
    return headers;
  },
});

export const baseQueryWithRedirect: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // Redirect to login page
    signOut({ callbackUrl: '/signin' });
  }
  return result;
};