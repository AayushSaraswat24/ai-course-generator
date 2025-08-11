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

// todo : make the front-end page for verify and make the send verifiyEmail page too and give its link on signIn page . 