
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 2rem; background: #f9fafb; border-radius: 10px; max-width: 500px; margin: auto;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <span style="font-size: 2rem; font-weight: bold; color: #2563eb; letter-spacing: 2px;">Courgen</span>
      </div>
      <h2 style="color: #1e293b;">Hello ${username},</h2>
      <p style="font-size: 1.1rem;">You requested to reset your password for <strong>Courgen</strong>.</p>
      <p style="margin-bottom: 1.5rem;">Please use the OTP below to proceed:</p>

      <div style="font-size: 2rem; font-weight: bold; background: #fbbf24; color: #1e293b;
                  padding: 16px 32px; display: inline-block; border-radius: 8px;
                  letter-spacing: 6px; margin-bottom: 1.5rem;">
        ${otp}
      </div>

      <p style="margin-top: 2rem;">Or click the button below to reset your password:</p>

      <a href="${resetUrl}" style="background-color: #2563eb; color: #fff;
         padding: 12px 28px; border-radius: 6px; text-decoration: none;
         display: inline-block; font-weight: 500; font-size: 1rem; margin-top: 12px;">
        Reset Password
      </a>

      <p style="margin-top: 1.5rem;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-word; color: #2563eb;">${resetUrl}</p>

      <p style="margin-top: 2rem; color: #64748b;">This code will expire in 5 minutes.<br>
      If you did not request this, please ignore this email.</p>

      <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 0.9rem; color: #94a3b8;">&copy; ${new Date().getFullYear()} Courgen</p>
    </div>
  `;
}
