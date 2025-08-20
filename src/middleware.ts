import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
   
    const token = req.nextauth.token;
    console.log('Token:', token);
    
    if (!token) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    
    if (token.role !== 'Admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};