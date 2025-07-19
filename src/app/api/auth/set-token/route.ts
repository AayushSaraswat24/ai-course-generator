import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try{

        const secret=process.env.NEXTAUTH_SECRET!;
        
        const token=await getToken({
            req:request,secret});
            
            if(!token){
                return NextResponse.json({
                    success:false,
                    message:"Unauthorized"
                },{status:401});
            }
            
            const cookiesStore=await cookies();
            
            cookiesStore.set("accessToken",token.accessToken,{
                httpOnly:true,
                secure:true,
                sameSite:"lax",
                maxAge:15*60, 
                path:"/",
            });
            
            cookiesStore.set("refreshToken",token.refreshToken,{
                httpOnly:true,
                secure:true,
                sameSite:"lax",
                maxAge:7*24*60*60,
                path:"/",
            });
            
            return NextResponse.json({
                success:true,
                message:"Tokens set successfully"
            },{status:200});
            
        }catch(error){
            console.log("Error setting tokens:", error);
            return NextResponse.json({
                success:false,
                message:"Internal Server Error"
            },{status:500});
        }
}