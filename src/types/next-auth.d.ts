import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      membershipId: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    membershipId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    membershipId?: string;
  }
}
