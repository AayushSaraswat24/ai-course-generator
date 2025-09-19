import { dbConnect } from "@/lib/mongodb";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import CourseModel from "@/model/courseModel";
import QuizModel from "@/model/quizModel";
import UserModel from "@/model/userModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request:NextRequest){
    try{
        const payload= verifyAccessToken(request);
        if(!payload){
            return NextResponse.json(
            {
                success: false,
                message: "Session Expired",
            },
            { status: 401 }
            );
        }

        await dbConnect();
        if (!mongoose.Types.ObjectId.isValid(payload.id)) {
            return NextResponse.json(
            {
            success: false,
            message: "Invalid id in token login again ",
            },
            { status: 400 }
            );
        }

        const userId = new mongoose.Types.ObjectId(payload.id);
        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
        return NextResponse.json(
            {
            success: false,
            message: "user not found re-loggin",
            },
            { status: 404 }
        );
        }

        const now = new Date();
        const sub = user.subscription;
        let currPlan = sub.plan;

        if (sub.plan !== "free" && sub.expiredAt && now > new Date(sub.expiredAt)) {
        user.subscription.plan = "free";
        await user.save();
        currPlan = "free";
        }

       const notes = await CourseModel.find({ _id: { $in: user.savedCourses } })
      .sort({ createdAt: -1 })
      .lean();

       const quizzes = await QuizModel.find({ _id: { $in: user.savedQuizzes } })
      .sort({ createdAt: -1 })
      .lean();

    
    return NextResponse.json({
      success: true,
      user: {
        name: user.userName,
        email: user.email,
        plan: currPlan,
      },
      notes,
      quizzes,
    });

    }catch(error){
        return NextResponse.json({
          success: false,
          message: "internal server error please try again later",
        }, { status: 500 });
    }
}