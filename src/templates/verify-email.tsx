import * as React from 'react';

export default function VerifyEmail({
  username,
  otp,
  verifyUrl,
}: {
  username: string;
  otp: string;
  verifyUrl: string;
}) {
 return `
    <div style="font-family: sans-serif; padding: 1rem; line-height: 1.5;">
      <h2>Hi ${username},</h2>
      <p>Use the following OTP to verify your email:</p>

      <div style="font-size: 1.5rem; font-weight: bold; background: #f4f4f5;
                  padding: 12px 20px; display: inline-block; border-radius: 6px;
                  letter-spacing: 4px;">
        ${otp}
      </div>

      <p style="margin-top: 1rem;">
        Or click the link below to verify your email directly:
      </p>

      <a href="${verifyUrl}" style="background-color: #0070f3; color: #fff;
         padding: 10px 20px; border-radius: 4px; text-decoration: none;
         display: inline-block; margin-top: 8px;">
        Verify Email
      </a>

      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p style="word-break: break-word;">${verifyUrl}</p>

      <p>This code will expire in 15 minutes.</p>
    </div>
  `;
}
