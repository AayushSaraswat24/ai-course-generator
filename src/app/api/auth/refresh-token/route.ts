import { generateAccessToken } from "@/lib/generateAccessToken";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';


export async function POST(request: NextRequest) {
    try{
        const refreshToken =request.cookies.get("refreshToken")?.value;
        if (!refreshToken) {
            return NextResponse.json({
                success: false,
                message: "Refresh token not found",
            }, { status: 401 });
        }

        const redisKey=`refreshToken:${refreshToken}`;
        const tokenData=await redis.get(redisKey) as string | null;

        if(!tokenData) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token",
            }, { status: 401 });
        }

        await redis.del(redisKey);

        const {id,email}=JSON.parse(tokenData);

        const accessToken=generateAccessToken({ id, email });
        const newRefreshToken=uuidv4();

        await redis.set(`refreshToken:${newRefreshToken}`, JSON.stringify({ id, email }),{ex:60*60*24*7}); 

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
       return NextResponse.json({
           success: false,
           message: "Internal server error ",
       }, { status: 500 });
    }
}