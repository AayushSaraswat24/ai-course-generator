import { dbConnect } from "@/lib/mongodb";
import { verifyAccessToken } from "@/lib/verifyAccessToken";
import PaymentModel from "@/model/paymentModel";
import { NextRequest, NextResponse } from "next/server";
import RazorPay from "razorpay";

const razorpay=new RazorPay({
    key_id:process.env.RAZORPAY_KEY_ID!,
    key_secret:process.env.RAZORPAY_KEY_SECRET!
});

const Plan_details: Record<string, { amount: number; expireAt: Date ; plan:string}> = {
    Pro1M: {
        amount: 39900,
        expireAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        plan:"pro"
    },
    Premium1M:{
        amount: 69900,
        expireAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        plan:"premium"
    },
    Pro1Y:{
        amount: 399000,
        expireAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        plan:"pro"
    },
    Premium1Y:{
        amount: 699000,
        expireAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        plan:"premium"
    }
}

export async function POST(request:NextRequest){
    try{
        const payload = verifyAccessToken(request);
            if (!payload) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Session Expired",
                },
                { status: 401 }
              );
            }

            const {sub}=await request.json();
            const plan=Plan_details[sub];

            if(!plan){
                return NextResponse.json(
                    {
                      success: false,
                      message: "Invalid plan selected",
                    },
                    { status: 400 }
                  );
            }

            await dbConnect();
            const order=await razorpay.orders.create({
                amount:plan.amount,
                currency:"INR",
                receipt:`recept-${Date.now()}`,
                notes:{
                    userId:payload.id,
                }
            });

            await PaymentModel.create({
                userId:payload.id,
                orderId:order.id,
                amount:plan.amount/100,
                status:"pending",
                plan:plan.plan,
                planExpiry:plan.expireAt,
            });

            return NextResponse.json({
                orderId:order.id,
                amount:order.amount,
                currency:order.currency,
                sub:plan.plan
            },{status:200});

    }catch(err:any){
        console.log(`error in orders route ${err}`);
            return NextResponse.json(
              {
                success: false,
                message: "Internal server error rara plz try again later",
              },
              { status: 500 }
            );
    }
}

// tasks -- setup payment page , add url to razorpay , setup ngrok to test and make sure to not to add it in github ,on dashboard page also make sure to show expiry .