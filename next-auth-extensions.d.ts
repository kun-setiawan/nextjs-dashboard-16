import { type DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface User {
    id?: string;
    role?: string;
  }
  interface Session {
    user?: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }
  interface Session {
    user?: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
