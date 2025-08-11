import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import UserModel from "@/model/userModel";
import { emailVerifySchema } from "@/schemas/emailVerifySchema";
import { NextResponse } from "next/server";

export async function POST(request:Request){
 try{
    const body = await request.json();
    const parseResult = emailVerifySchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({
            success: false,
            message: parseResult.error.issues[0].message,
        }, { status: 400 });
    }
    await dbConnect();
    const { email, otp } = parseResult.data;

    const user=await UserModel.findOne({email:email.toLowerCase().trim()});

    if(!user){
        return NextResponse.json({
            success: false,
            message: "User not found with this email",
        }, { status: 404 });
    }

    if(user.isVerified===true){
        return NextResponse.json({
          success: false,
          message: "User is already verified"
        }, { status: 400 });
    }
 
    const redisKey=`otp:${email.toLowerCase().trim()}`;
    const storedOtp=await redis.get(redisKey);
    if(!storedOtp){
        return NextResponse.json({
            success: false,
            message: "OTP has expired or is invalid",
        }, { status: 400 });
    }

    if(storedOtp != otp){
        return NextResponse.json({
            success: false,
            message: "Invalid OTP",
        }, { status: 400 });
    }

    user.isVerified = true;
    await user.save();
    await redis.del(redisKey);

    return NextResponse.json({
        success: true,
        message: "Email verified successfully",
    }, { status: 200 });

 }catch(error:any){
    console.log(`Error in email verification: ${error.message}`);
    return NextResponse.json({
      success: false,
      message: "internal server error",
    }, { status: 500 });
 }
}