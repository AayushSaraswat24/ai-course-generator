import { verifyAccessToken } from "@/lib/verifyAccessToken";
import UserModel from "@/model/userModel";
import QuizModel from "@/model/quizModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = verifyAccessToken(request);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(payload.id);
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const savedCount = await QuizModel.countDocuments({ createdBy: user._id });
    const limit =
      user.subscription.plan === "free" ? 5 :
      user.subscription.plan === "pro" ? 20 : 30;

    if (savedCount >= limit) {
      return NextResponse.json({
        success: false,
        message: "Quiz save limit reached for your plan",
      }, { status: 403 });
    }

    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid or empty quiz data" }, { status: 400 });
    }


    for (const q of questions) {
      if (
        !q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" || typeof q.explanation !== "string"
      ) {
        return NextResponse.json({ success: false, message: "Malformed question in quiz" }, { status: 400 });
      }
    }

    const quiz = await QuizModel.create({
      questions,
      createdBy: user._id,
    });

    user.savedQuizzes.push(quiz._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Quiz saved successfully",
      quizId: quiz._id,
    });

  } catch (error: any) {
    console.error("Error in save-quiz route:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
