import { verifyAccessToken } from "@/lib/verifyAccessToken";
import QuizModel from "@/model/quizModel";
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
    const quizId = searchParams.get("id");

    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return NextResponse.json({ success: false, message: "Invalid quiz ID" }, { status: 400 });
    }

    const user = await UserModel.findById(payload.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await QuizModel.deleteOne({ _id: quizId, createdBy: user._id });
    user.savedQuizzes = user.savedQuizzes.filter(id => id.toString() !== quizId);
    await user.save();

    return NextResponse.json({ success: true, message: "Quiz deleted" });

  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
