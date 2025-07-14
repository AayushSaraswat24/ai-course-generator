import * as React from 'react';

export default function ForgotPassword({
  username,
  otp,
  resetUrl,
}: {
  username: string;
  otp: string;
  resetUrl: string;
}) {
  return `
    <div style="font-family: sans-serif; padding: 1rem; line-height: 1.5;">
      <h2>Hello ${username},</h2>
      <p>You requested to reset your password. Use the OTP below:</p>

      <div style="font-size: 1.5rem; font-weight: bold; background: #f4f4f5;
                  padding: 12px 20px; display: inline-block; border-radius: 6px;
                  letter-spacing: 4px;">
        ${otp}
      </div>

      <p style="margin-top: 1rem;">
        Or click the button below to go to the reset page:
      </p>

      <a href="${resetUrl}" style="background-color: #d97706; color: #fff;
         padding: 10px 20px; border-radius: 4px; text-decoration: none;
         display: inline-block; margin-top: 8px;">
        Reset Password
      </a>

      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-word;">${resetUrl}</p>

      <p>This code will expire in 15 minutes.</p>
    </div>
  `;
}
