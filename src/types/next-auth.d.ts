import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      userName: string;
      plan:'free' | 'pro' | 'enterprise';
    };
  }

  interface User {
    id: string;
    email: string;
    userName: string;
    plan:'free' | 'pro' | 'enterprise';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    userName:string;
    accessToken: string;
    refreshToken: string;
    plan:'free' | 'pro' | 'enterprise';
  }
}
