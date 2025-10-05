import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/mongodb";
import PaymentModel, { Payment } from "@/model/paymentModel";
import UserModel from "@/model/userModel";
import { sendPurchaseEmail } from "@/utils/mailSenders";

export async function POST(request:NextRequest){
    try{
        const body = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest("hex");

        if (expectedSignature !== signature) {
        return NextResponse.json(
            {
            success: false,
            message: "Invalid signature",
            },
            { status: 400 }
        ); 
        }

        const event = JSON.parse(body);
        await dbConnect();

        const payment = event.payload.payment.entity;

        if (event.event === "payment.captured") {
            const updatedPayment = (await PaymentModel.findOneAndUpdate(
                { orderId: payment.order_id },
                {
                paymentId: payment.id,
                status: "active",
                },
                { new: true }
            )) as Payment | null;

            if (!updatedPayment) {
                return NextResponse.json(
                {
                    success: false,
                    message: "Payment not found for update",
                },
                { status: 500 }
                );
            }

            const { userId, plan ,planExpiry } = updatedPayment;
            const user = await UserModel.findById(userId);

            if (!user) {
                return NextResponse.json(
                {
                    success: false,
                    message: "User not found for this payment",
                },
                { status: 500 }
                );
            }

            const now = new Date();

            user.subscription.plan = plan;
            user.subscription.startedAt=now;
            user.subscription.expiredAt = planExpiry;
            user.subscription.status = "active";
            await user.save();

            try {
                const res = await sendPurchaseEmail(user.email, user.userName, plan, now.toDateString(), (updatedPayment.amount).toString() );
                  if (!res.success) {
                        throw new Error(res.error);
                    }
                } catch (err) {
                    console.log("Failed to send purchase email:", err);
                };

     }else if (event.event === "payment.failed") {
        await PaymentModel.findOneAndUpdate(
            { orderId: payment.order_id },
            {
            paymentId: payment.id,
            status: "failed",
            }
        );
    } else if (event.event === "payment.refunded") {
        await PaymentModel.findOneAndUpdate(
            { orderId: payment.order_id },
            {
            paymentId: payment.id,
            status: "refunded",
            }
        );
    } else {
      console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed",
      },
      { status: 200 }
    );

    }catch(err:any){
        console.log(`error in razorpay webhook ${err}`);
        return NextResponse.json({
        success: false,
        message: "Internal server error"
        }, { status: 500 });
    }
}