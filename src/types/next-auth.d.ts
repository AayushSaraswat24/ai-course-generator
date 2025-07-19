import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      userName: string;

    };
  }

  interface User {
    id: string;
    email: string;
    userName: string;

  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userName:string;
    accessToken: string;
    refreshToken: string;
  }
}
