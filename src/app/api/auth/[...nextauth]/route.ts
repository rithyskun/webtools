import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

// NOTE: environment variables must be defined in your environment or .env file.
// See README.md and .env.example for details.

export const authOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      issuer: process.env.AUTH0_ISSUER || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Use a secret to encrypt the JWT, and for NextAuth internal security
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    // you can leave these commented if you want to rely on the
    // built‑in NextAuth pages instead of custom ones
    // signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error",
  },
  callbacks: {
    // add any callbacks you need, e.g. to persist custom properties
    async jwt({ token, user }: { token: any; user?: any }) {
      // first time jwt callback is run, user object is available
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
