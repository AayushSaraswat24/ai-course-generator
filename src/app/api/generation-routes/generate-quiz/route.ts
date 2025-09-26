import { generateQuiz } from "@/lib/helper/generateQuiz";
import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import UserModel from "@/model/userModel";
import { quizSchema } from "@/schemas/quizSchema";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try{
        const payload=verifyAccessToken(request);
        if(!payload){
            return NextResponse.json({
              success: false,
              message: "Session Expired"
            }, { status: 401 });
        }

        const body=await request.json();

        const parsed=quizSchema.safeParse(body);
        if(!parsed.success){
            const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
            return NextResponse.json({
            success: false,
            message: firstError,
          }, { status: 400 });
        }

        const {prompt,userKnowledge}=parsed.data;

        if(!mongoose.Types.ObjectId.isValid(payload.id)){
          return NextResponse.json({
            success: false,
            message: "Invalid id in token login again "
          }, { status: 400 });
        }

        await dbConnect();
        const userId=new mongoose.Types.ObjectId(payload.id);
        const user= await UserModel.findOne({_id:userId});
        if(!user){
            return NextResponse.json({
              success: false,
              message: "User not found"
            }, { status: 404 });
        }

        const now=new Date();
        const sub=user.subscription;
        
        if (
          (sub.plan !== 'free') &&
          sub.expiredAt &&
          now > new Date(sub.expiredAt)
        ) {

          user.subscription.plan = 'free';
          await user.save();

          return NextResponse.json({
            success: false,
            message: "Your subscription has expired. Please renew to continue using pro features.",
          }, { status: 403 });
        }

       
        const redisKey=`quiz:${user._id}`;
        const quota=await redis.get<number | null>(redisKey);
        const requestLimit=quota ? quota : 1;
       
        // max 10 request per week for free user and 20 for pro .
        if((user.subscription.plan=='free' && requestLimit>=10) || (user.subscription.plan=='pro' && requestLimit>=20) ){
            const ttl=await redis.ttl(redisKey);
             return NextResponse.json({
               success: false,
               message: "request quota reach .",
               retryAfter:`${(ttl / 86400).toFixed(1)} days`,
             }, { status: 429 });
        }

        const quizString=await generateQuiz(prompt,userKnowledge);
        if(!quizString){
            return NextResponse.json({
              success: false,
              message: "error in ai response"
            }, { status: 500 });
        }
        const quiz=JSON.parse(quizString);
        
        if(!quiz.questions){
            return NextResponse.json({
              success: false,
              message: "Quiz format is invalid. ai error",
            }, { status: 500 });
        }
        //2nd part of suspected code . done this for incresing the quota only if ai returns a valid response .
        const updateQuota=await redis.incr(redisKey);
         if(updateQuota===1){
            await redis.expire(redisKey,60*60*24*7);
        }

        return NextResponse.json({
          success: true,
          message: "quiz generated successfully ",
          quiz
        }, { status: 200 });

    }catch(error:any){
        console.log(`Error in quiz generation route: ${error}`);
        return NextResponse.json({
          success: false,
          message: "Something went wrong. Please try again later.",
        }, { status: 500 });
    }
}
 