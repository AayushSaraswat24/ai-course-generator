import { sendEmail } from "./email";
import VerifyEmail from "@/templates/verify-email";
import ResetPassword from "@/templates/forgot-password";
import PurchaseEmail from "@/templates/purchase";

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function sendVerificationEmail(to: string, username: string, otp: string) {
    const verifyUrl = `${BaseUrl}/verify?email=${encodeURIComponent(to)} `;
    const html=VerifyEmail({username,otp,verifyUrl})

    return sendEmail({
        to,
        subject: "Verify your email",
        html
    });
}

export async function sendResetPasswordEmail(to: string, username: string, otp: string) {
    const resetUrl = `${BaseUrl}/reset?email=${encodeURIComponent(to)}`;
    const html=ResetPassword({username,otp,resetUrl});

    return sendEmail({
        to,
        subject: "Reset your password",
        html
    });
}

export async function sendPurchaseEmail(to: string, username: string, subscription: string, purchaseDate: string, amount: string
) {
    const html=PurchaseEmail({username,subscription,purchaseDate,amount});
    return sendEmail({
        to,
        subject: 'Your course purchase is confirmed!',
        html
    });
}