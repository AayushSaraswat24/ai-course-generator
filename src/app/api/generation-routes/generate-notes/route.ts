import { concurrentFetchYoutubeVideos } from "@/lib/helper/concurrentFetchYtVideos";
import { courseGenerator } from "@/lib/helper/courseGenerator";
import { generateCoursePlan } from "@/lib/helper/generateCoursePlan";
import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import UserModel from "@/model/userModel";
import { courseInputSchema } from "@/schemas/courseInputSchema";
import { AiResponse } from "@/types/topicRetriverAi";
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
        const parsed=courseInputSchema.safeParse(body);
        if (!parsed.success) {
          const firstError = parsed.error.issues?.[0]?.message || "Invalid input";

          return NextResponse.json({
            success: false,
            message: firstError,
          }, { status: 400 });
        }

        const {prompt,userKnowledge,includeVideos}=parsed.data;

        await dbConnect();
        if(!mongoose.Types.ObjectId.isValid(payload.id)){
          return NextResponse.json({
            success: false,
            message: "Invalid id in token login again "
          }, { status: 400 });
        }

        const userId=new mongoose.Types.ObjectId(payload.id);
        const user= await UserModel.findOne({_id:userId});
        if(!user){
            return NextResponse.json({
              success: false,
              message: "user not found re-loggin"
            }, { status: 404 });
        }

        const now = new Date();
        const sub = user.subscription;
        const currPlan=sub.plan;
        if (
          (sub.plan !== 'free') &&
          sub.expiredAt &&
          now > new Date(sub.expiredAt)
        ) {

          user.subscription.plan = 'free';
          await user.save();

          return NextResponse.json({
            success: false,
            message: `Your subscription has expired. Please renew to continue using ${currPlan} features.`,
          }, { status: 403 });
        }


        const redisKey=`notes:${user._id}`;
        const requestLimit=await redis.incr(redisKey);
        if(requestLimit===1){
            await redis.expire(redisKey,60*60*24*7);
        }
        // reduce the limit to 4 and 20 .
        if((user.subscription.plan=='free' && requestLimit>400) || (user.subscription.plan=='pro' && requestLimit>200) ){
            const ttl=await redis.ttl(redisKey);
            const hoursLeft = Math.ceil(ttl / 3600);
             return NextResponse.json({
               success: false,
               message: `Request quota reached. Try again in ${hoursLeft} hour(s).`,
             }, { status: 429 });
        }

        const jsonResponse=await generateCoursePlan(prompt,userKnowledge,includeVideos);
        if(!jsonResponse){
            return NextResponse.json({
              success: false,
              message: "ai is not responding"
            }, { status: 500 });
        }
        const topics=JSON.parse(jsonResponse) as AiResponse;

        if(topics.prompt.inappropriate=='true'){
            return NextResponse.json({
              success: false,
              message: `The prompt you provided violates our content guidelines. it contain ${topics.prompt.cause}`,
            }, { status: 400 });
        }
        const ytVideosPromise=includeVideos ? concurrentFetchYoutubeVideos(topics.subtopics) : Promise.resolve(null);
       
        // integrate courseGenerator and return the stream and then check .
        const subTopics = JSON.stringify([
        topics.mainTopic,
        ...topics.subtopics.map((item) => item.title),
        ]);
        const encoder = new TextEncoder();
        const notesStreamPromise=courseGenerator(topics.mainTopic,subTopics,userKnowledge)

        const [ytVideos,notesStream]=await Promise.all([
          ytVideosPromise,
          notesStreamPromise
        ])

        if(!notesStream){
          return NextResponse.json({
            success: false,
            message: "failed to generate notes "
          }, { status: 500 });
        }

        const stream = new ReadableStream({
          async start(controller) {

            controller.enqueue(
        encoder.encode(JSON.stringify({ type: "metadata", ytVideos, mainTopic: topics.mainTopic }) + "\n")
        );


            const reader = notesStream.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value); 
            }

            controller.close();
          },
        });

        return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache"
      },
    });

    }catch(error:any){
        console.log(`error in generate-notes route ${error}`);
        return NextResponse.json({
          success: false,
          message: "Internal server error rara"
        }, { status: 500});
    }
}
