import { NextRequest, NextResponse } from 'next/server';
import { extractText, validateWordLimit } from '@/lib/pdfToTextConverter';
import { pdfSummarizer } from '@/lib/helper/pdfSummarizer';
import { pdfUploadSchema } from '@/schemas/pdfSummarizationSchema';
import { verifyAccessToken } from '@/lib/verifyAccessToken';
import UserModel from '@/model/userModel';
import mongoose from 'mongoose';
import { redis } from '@/lib/redis';
import { dbConnect } from '@/lib/mongodb';


export async function POST(req: NextRequest) {
    try {
        const payload=verifyAccessToken(req);
        if(!payload){
            return NextResponse.json({
              success: false,
              message: "Session Expired"
            }, { status: 401 });
        }
        const formData = await req.formData();
        const file = formData.get('file') as File;

        const parsed=pdfUploadSchema.safeParse({file});
        if(!parsed.success){
            return NextResponse.json({
              success: false,
              message: parsed.error.format()
            }, { status: 400 });
        }

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

        const pdfSummarizationLimitKey=`pdf:${user._id}`;
        const requestLimit=await redis.incr(pdfSummarizationLimitKey);
        if(requestLimit===1){
            await redis.expire(pdfSummarizationLimitKey,60*60*24*7);
        }

         if((user.subscription.plan=='free' && requestLimit>3) || (user.subscription.plan=='pro' && requestLimit>20) ){
            const ttl=await redis.ttl(pdfSummarizationLimitKey);
            const hoursLeft = Math.ceil(ttl / 3600);
             return NextResponse.json({
               success: false,
               message: `Request quota reached. Try again in ${hoursLeft} hour(s).`,
             }, { status: 429 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await extractText(buffer);
        console.log("EXTRACTED TEXT:\n", text);
        const validation = validateWordLimit(text, sub.plan as any);

        if (!validation.valid) {
            return NextResponse.json({
              success: false,
              message: `PDF is too long. Word limit exceeded by ${validation.overLimitBy} words. total size by words: ${validation.wordCount}`
            }, { status:400  });
        }

        const stream = await pdfSummarizer(text);
        return new Response(stream);
    } catch (err: any) {
        console.log('Error in summarize PDF route:', err);
        return NextResponse.json({
          success: false,
          message: "failed to process pdf "
        }, { status: 500 });
    }
}
