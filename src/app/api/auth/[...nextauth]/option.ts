import UserModel from "@/model/userModel";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "@/lib/generateAccessToken";
import { v4 as uuid } from "uuid";
import { redis } from "@/lib/redis";
import { dbConnect } from "@/lib/mongodb";
import { loginSchema } from "@/schemas/loginSchema";

export const authOptions :NextAuthOptions= {
    providers:[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials){
                await dbConnect();
                const result=loginSchema.safeParse(credentials);
                if(!result.success) {
                    throw new Error("Invalid email or password.");
                }
                
                const user=await UserModel.findOne({
                    email:result.data.email.toLowerCase().trim(),
                })
                if(!user) {
                    throw new Error("User not found.");
                }
                if(!user.password) {
                    throw new Error("Please login with Google.");
                }
                const isPasswordValid=await bcrypt.compare(result.data.password, user.password);
                if(!isPasswordValid) {
                    throw new Error("Invalid password.");
                }

                if(!user.isVerified) {
                    throw new Error("Please verify your email before login.");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    userName: user.userName,
                    plan:user.subscription.plan,
                };
            }
        })

    ],

    session:{
        strategy: "jwt",
        maxAge:60*60,
    },

    callbacks:{
        async signIn({user,account}){
            if(account?.provider === 'google') {

                if (!user.email) throw new Error("Google account didn't return email")
                await dbConnect();
                const existingUser = await UserModel.findOne({ email: user.email });

                if (existingUser?.password) {
                throw new Error("You've already signed up using email/password. Please login using that method.");
                 }
                 
                if (!existingUser) {
                    let userName = user.email.split('@')[0];
                    if (userName.length > 20) {
                        userName = userName.slice(0, 20);
                    }
                    const newUser = await UserModel.create({
                        email: user.email,
                        userName,
                        isVerified: true, 
                    });
                    
                    user.id=newUser._id.toString();
                    user.plan=newUser.subscription.plan;
                }else{
                    user.id=existingUser._id.toString();
                    user.plan=existingUser.subscription.plan;
                }
                let userName = user.email.split('@')[0];
                    if (userName.length > 20) {
                        userName = userName.slice(0, 20);
                    }
                user.userName=userName;
            }
            return true;
        },

        async jwt({token,user,account}){
            
            if(user && account){
                const accessToken=generateAccessToken({id:user.id,email:user.email,plan:user.plan});

                const refreshToken=uuid();
                const redisKey=`refreshToken:${refreshToken}`;
                try{
                    await redis.set(redisKey,JSON.stringify({id:user.id,email:user.email,plan:user.plan}),{ex:60*60*24*7});
                }catch(err){
                    console.error("Error storing refresh token in Redis:",err);
                    throw new Error("Internal server error");
                }

                return {
                    ...token ,
                    id:user.id,
                    email:user.email,
                    userName:user.userName,
                    plan:user.plan,
                    accessToken,
                    refreshToken
                }
            }
            return token ;
        },

        async session({session,token}){
            if(token){
                session.user={
                    id:token.id,
                    email:token.email,
                    userName:token.userName,
                    plan:token.plan
                }
            }
            return session;
        },

    },
    pages:{
        signIn:'/signin',
        error:'/error'
    },
    jwt:{
        maxAge:60*60,
    },
    secret:process.env.NEXTAUTH_SECRET!
}

// jwt callback token is handled internally by next-auth while session token is sent to the client cookies so we just take the non-sensitive info from token and store in session token .  also at each callback we are only repeating the neccessary process on intial sign-in that include sign-in done intentionally not triggered by any other event . to sign-in only when we want we use if condition like user && account or if token etc . 