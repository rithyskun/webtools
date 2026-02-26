// ambient declarations so TypeScript doesn't complain when the package
// isn't installed in the development container.  In a real project you
// should install `next-auth` and the appropriate types instead.

declare module "next-auth";
declare module "next-auth/react";
declare module "next-auth/jwt";
declare module "next-auth/providers/auth0";
declare module "next-auth/providers/github";
declare module "next-auth/providers/google";
