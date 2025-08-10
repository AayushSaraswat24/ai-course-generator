import { NextResponse } from "next/server";
import { registerSchema } from "@/schemas/registerSchema";
import UserModel from "@/model/userModel";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/utils/mailSenders";
import { redis } from "@/lib/redis";
import { dbConnect } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.error.issues.map(issue => issue.message).join(', '),
      }, { status: 400 });
    }
    await dbConnect();
    const { email, password, userName } = result.data;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists with this email",
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
     const res= await sendVerificationEmail(email.toLowerCase().trim(), userName, otp);
     if(!res.success){
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

    await redis.set(`otp:${email.toLowerCase().trim()}`, otp, { ex: 60 * 5 });

    const newUser = await UserModel.create({
      userName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false,
    })

    return NextResponse.json({
      success: true,
      message: "User registered successfully and verification email sent",
    }, { status: 201 });

  } catch (error) {
    console.log(`Error in registration: ${error}`);
    return NextResponse.json({
      success: false,
      message: "Error during registration",
    }, { status: 500 });
  }
}