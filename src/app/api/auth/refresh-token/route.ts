import { generateAccessToken } from "@/lib/generateAccessToken";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

 enum Plan { Free = 'free', Pro = 'pro', Enterprise = 'enterprise' }
 type TokenData = { id: string; email: string; plan: Plan };

export async function POST(request: NextRequest) {
    try{
        const refreshToken =request.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            const res= NextResponse.json({
                success: false,
                message: "Refresh token not found. Please log in again.",
            }, { status: 401 });
            res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
            res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
            return res;
        }

        const redisKey=`refreshToken:${refreshToken}`;
        const tokenData=await redis.get(redisKey) ;

        if(!tokenData) {
            const res= NextResponse.json({
                success: false,
                message: "Invalid or expired token",
            }, { status: 401 });
            res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
            res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
            return res;
        }
  
        await redis.del(redisKey);

        const { id, email, plan } = tokenData as TokenData;

        const accessToken=generateAccessToken({ id, email,plan });
        const newRefreshToken=uuidv4();

        await redis.set(`refreshToken:${newRefreshToken}`, JSON.stringify({ id, email, plan }),{ex:60*60*24*7}); 

        const response= NextResponse.json({
            success: true, 
        },{status:200});
        
        response.cookies.set('accessToken',accessToken,{
            httpOnly:true,
            secure:true,
            sameSite: 'strict',
            maxAge: 60 * 15,  
            path: '/',
        })

        response.cookies.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        return response;

    }catch(error:any){
       console.log("Error storing refresh token:", error);

    const res = NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 401 });

    // Clear both cookies just in case
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });

    return res;

    }
}