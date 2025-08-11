import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import UserModel from "@/model/userModel";
import { sendVerificationEmail } from "@/utils/mailSenders";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const emailSchema = z.object({
            email: z.string().email(),
        });

        const parsedBody = emailSchema.parse(body);
        if (!parsedBody.email) {
            return NextResponse.json({
                success: false,
                message: "Invalid email address."
            }, { status: 400 });
        }

        await dbConnect();
        const email = parsedBody.email.toLowerCase().trim();
        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "no user exists with this email."
            }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({
                success: false,
                message: "User is already verified."
            }, { status: 400 });
        }

        const redisOtpRateKey = `Rate:otp:${email}`;
        const rate = await redis.incr(redisOtpRateKey);
        if (rate == 1) {
            await redis.expire(redisOtpRateKey, 120);
        }

        if (rate > 4) {
            return NextResponse.json({
                success: false,
                message: "Too many requests. Please try again later."
            }, { status: 429 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

        try {
            const res = await sendVerificationEmail(email, user.userName, otp);
            if (!res.success) {
                throw new Error(res.error);
            }
        } catch (err) {
            console.error("Failed to send verification email:", err);
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to send verification email. Please try again later.",
                },
                { status: 500 }
            );
        }

        await redis.set(`otp:${email}`, otp, { ex: 60 * 5 });

        return NextResponse.json({
            success: true,
            message: "Verification email sent successfully."
        }, { status: 200 });

    } catch (error: any) {
        console.log(`Error in sendVerificationEmail: ${error.message}`);
        return NextResponse.json({
            success: false,
            message: "Failed to send verification email. Please try again later.",
        }, { status: 500 });
    }
}