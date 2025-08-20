import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials) {
          const user = { id: "1", name: "J Smith", email: "jsmith@example.com" };
          if (user) {
            return user;
          }
        }
        return null;
      },
    }),
  ],
});

export { handler as GET, handler as POST };