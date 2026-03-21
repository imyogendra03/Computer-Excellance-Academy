const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendVerificationEmail = async (toEmail, token) => {
  const link = `http://localhost:${process.env.PORT}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Exam Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Email Verify karo",
    html: `<p>Apna account verify karne ke liye yahan click karo:</p>
           <a href="${link}" style="padding:10px 20px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a>`,
  });
};

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Exam Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset OTP",
    html: `<div style="font-family:Arial;max-width:400px;padding:24px;border:1px solid #eee;border-radius:8px">
             <h2>Password Reset</h2>
             <h1 style="letter-spacing:8px;color:#4F46E5">${otp}</h1>
             <p style="color:#888;font-size:13px">Valid for <strong>${process.env.OTP_EXPIRY_MINUTES} minutes</strong></p>
           </div>`,
  });
};

module.exports = { sendVerificationEmail, sendOTPEmail };