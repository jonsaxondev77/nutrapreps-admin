// next-auth.d.ts
import NextAuth, { Account, DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AccountStatus } from '.';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'user';
      status: AccountStatus;
      jwtToken: string;
      refreshToken: string;
    } & DefaultSession['user'];
    error?: 'RefreshAccessTokenError';
  }

  interface User {
    id: string;
    role: 'admin' | 'user';
    status: AccountStatus;
    jwtToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'user';
    status: AccountStatus;
    jwtToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: 'RefreshAccessTokenError';
  }
}