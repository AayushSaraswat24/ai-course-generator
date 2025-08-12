import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import UserModel from "@/model/userModel";
import { sendResetPasswordEmail } from "@/utils/mailSenders";
import { NextResponse } from "next/server";
import {z} from "zod";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const emailSchema = z.object({
            email: z.string().email(),
        });

        const parsedBody = emailSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({
            success: false,
            message: "Invalid email address."
            }, { status: 400 });
        }

        await dbConnect();
        const email = parsedBody.data.email.toLowerCase().trim();
        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "no user exists with this email."
            }, { status: 404 });
        }

        if(!user.password){
            return NextResponse.json({
              success: false,
              message: "This email is registered using a different sign-in method."
            }, { status: 400 });
        }

        if (!user.isVerified) {
            return NextResponse.json({
                success: false,
                message: "User is not verified."
            }, { status: 400 });
        }

        const redisPasswordRateKey = `Rate:forgotPassword:${email}`;
        const rate = await redis.incr(redisPasswordRateKey);
        if (rate == 1) {
            await redis.expire(redisPasswordRateKey, 120);
        }

        if (rate > 3) {
            return NextResponse.json({
                success: false,
                message: "Too many requests. Please try again later."
            }, { status: 429 });
        }
        const token = uuidv4();
        console.log(`token: ${token}`);
        try{
            const res = await sendResetPasswordEmail(email, user.userName, token);
            if (!res.success) {
                throw new Error(res.error);
            }
        }catch (err) {
            console.log("Failed to send forgot password email:", err);
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send forgot password email. Please try again later.",
                },
                { status: 500 }
            );
        }

        const redisPasswordTokenKey=`token:forgotPassword:${token}`;
        await redis.set(redisPasswordTokenKey, email, { ex: 60 * 15 });

        return NextResponse.json({
            success: true,
            message: "Forgot password email sent successfully."
        }, { status: 200 });

}catch (error) {
    console.log("Error occurred while processing forgot password request:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process forgot password request."
    }, { status: 500 });
}
}
