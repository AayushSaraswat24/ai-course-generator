import { generateCoursePlan } from "@/lib/helper/generateNotesPlan";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    const {rawTopic,userKnowledge,includeVideos}=await request.json();
    const ai=await generateCoursePlan(rawTopic,userKnowledge,includeVideos);
    console.log(`response ${ai}`);
    return NextResponse.json({
        response:ai
    })
}

// todo : make the send verify email link on signIn page beautiul. make the forgot password route + page and add that to sign in and then start working on front-end of main features .