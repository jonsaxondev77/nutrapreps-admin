import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
            const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/accounts/authenticate`;
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if(!response.ok) {
                const errorText = response.text();
                return null;
            }

            const userData = await response.json();

            return userData;

        } catch(error) {
            console.error('Authorize: Network error or unexpected issue during authentication:', error);
            return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    async jwt({token, user}) {
        if(user) {
            token.id = user.id;
            token.jwtToken = user.jwtToken;
            token.role = user.role;
        }
        return token;
    },
    async session({session, token}) {
        if(token) {
            session.user.role = token.role;
            session.user.jwtToken = token.jwtToken;
        }
        return session;
    }
  }
};