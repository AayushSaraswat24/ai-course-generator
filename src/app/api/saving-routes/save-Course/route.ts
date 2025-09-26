import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import CourseModel from "@/model/courseModel";
import UserModel from "@/model/userModel";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const payload = verifyAccessToken(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Session Expired" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, notes, videoLinks } = body;


    if (!Array.isArray(title) || !Array.isArray(notes)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing title/notes" },
        { status: 400 }
      );
    }

    await dbConnect();
    const userId = new mongoose.Types.ObjectId(payload.id);
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

 
    const plan = user.subscription.plan;
    const savedCount = user.savedCourses.length;
    // set free to 5 , pro to 15 and premium to 30 .
    const limit = plan === "free" ? 5 : plan === "pro" ? 15 : 30;

    if (savedCount >= limit) {
      return NextResponse.json(
        { success: false, message: `You can only save up to ${limit} courses on the ${plan} plan.` },
        { status: 403 }
      );
    }

    const course = await CourseModel.create({
      title,
      notes,
      videoLinks,
      createdBy: user._id,
    });

    user.savedCourses.push(course._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Course saved successfully", courseId: course._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving course:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
