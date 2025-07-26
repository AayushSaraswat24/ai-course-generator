import { concurrentFetchYoutubeVideos } from "@/lib/helper/concurrentFetchYtVideos";
import { courseGenerator } from "@/lib/helper/courseGenerator";
import { generateCoursePlan } from "@/lib/helper/generateCoursePlan";
import { redis } from "@/lib/redis";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import UserModel from "@/model/userModel";
import { AiResponse } from "@/types/topicRetriverAi";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
    try{
        // const payload=verifyAccessToken(request);
        // if(!payload){
        //     return NextResponse.json({
        //       success: false,
        //       message: "unauthorized"
        //     }, { status: 401 });
        // }
        const {prompt,userKnowledge,includeVideos}=await request.json();

        // const user= await UserModel.findOne({_id:payload.id});
        // if(!user){
        //     return NextResponse.json({
        //       success: false,
        //       message: "user not found re-loggin"
        //     }, { status: 404 });
        // }

        // const redisKey=`limit:${user._id}`;
        // const requestLimit=await redis.incr(redisKey);
        // if(requestLimit===1){
        //     await redis.expire(redisKey,60*60*24*7);
        // }
        
        // if((user.subscription.plan=='free' && requestLimit>4) || (user.subscription.plan=='pro' && requestLimit>20) ){
        //     const ttl=await redis.ttl(redisKey);
        //      return NextResponse.json({
        //        success: false,
        //        message: "request quota reach .",
        //        retryAfter:`${((ttl/60)/60)/24}`
        //      }, { status: 429 });
        // }

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
              message: `The prompt you provided violates our content guidelines. it contain ${topics.prompt.contain}`,
            }, { status: 400 });
        }
        const ytVideos=includeVideos ? await concurrentFetchYoutubeVideos(topics.subtopics) : null;
       
        // integrate courseGenerator and return the stream and then check .
        const subTopics = JSON.stringify([
        topics.mainTopic,
        ...topics.subtopics.map((item) => item.keyword),
        ]);
        const encoder = new TextEncoder();
        const notesStream=await courseGenerator(topics.mainTopic,subTopics,userKnowledge)

        if(!notesStream){
          return NextResponse.json({
            success: false,
            message: "failed to generate notes "
          }, { status: 500 });
        }

        const stream = new ReadableStream({
          async start(controller) {

            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "metadata", ytVideos }) + "\n")
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
          message: "Internal server error"
        }, { status: 500});
    }
}

// more error handling and try to reduce the response time currently taking 26 second for whole route .