import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env if not already loaded globally


export async function sendEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: {
      user: 'resend',
      pass: 're_8bFHUcoX_3jftktPzfiPnJ3rMiNg2Z3jN' ,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.RESEND_FROM,
    to: '',
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  console.log('Message sent: %s', info.messageId);
}

// sendEmail().catch(console.error);
