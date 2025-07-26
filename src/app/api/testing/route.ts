import { generateCoursePlan } from "@/lib/helper/generateCoursePlan";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    const {rawTopic,userKnowledge,includeVideos}=await request.json();
    const ai=await generateCoursePlan(rawTopic,userKnowledge,includeVideos);
    console.log(`response ${ai}`);
    return NextResponse.json({
        response:ai
    })
}