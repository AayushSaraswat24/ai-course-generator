import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import UserModel from "@/model/userModel";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {z} from "zod";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const resetSchema = z.object({
            token: z.uuid("token is not valid"),
            newPassword: z.string().min(6,"Password must be at least 6 characters long").max(20,"Password must be at most 20 characters long"),
        });

        const parsedBody = resetSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({
                success: false,
                message: parsedBody.error.issues.map(issue => issue.message).join(', '),
            }, { status: 400 });
        }

        const { token, newPassword } = parsedBody.data;

        await dbConnect();

        const email = await redis.get(`token:forgotPassword:${token}`);
        if (!email) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token."
            }, { status: 400 });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            }, { status: 404 });
        }

        if(!user.password){
            return NextResponse.json({
              success: false,
              message: "This email is registered using a different sign-in method."
            }, { status: 400 });
        }
        const hashedPassword=await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await redis.del(`token:forgotPassword:${token}`);

        return NextResponse.json({
            success: true,
            message: "Password reset successfully."
        }, { status: 200 });

    } catch (error) {
        console.log("Error occurred while processing reset password request:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to process reset password request."
        }, { status: 500 });
    }
}
