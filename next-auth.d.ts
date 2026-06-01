// next-auth.d.ts
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"]; // Keeps the default name, email, and image properties
    }
}