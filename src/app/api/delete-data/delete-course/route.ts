import { verifyAccessToken } from "@/lib/verifyAccessToken";
import CourseModel from "@/model/courseModel";
import UserModel from "@/model/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const payload = verifyAccessToken(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ success: false, message: "Invalid course ID" }, { status: 400 });
    }

    const user_id=new mongoose.Types.ObjectId(payload.id);
    const user = await UserModel.findById(user_id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await CourseModel.deleteOne({ _id: courseId, createdBy: user._id });
    user.savedCourses = user.savedCourses.filter(id => id.toString() !== courseId);
    await user.save();

    return NextResponse.json({ success: true, message: "Course deleted" });

  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
