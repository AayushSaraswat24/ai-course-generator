import nodemailer from 'nodemailer';

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.APP_PASSWORD!,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.log('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
