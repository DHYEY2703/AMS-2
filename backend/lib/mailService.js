import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendAttendanceEmail = async (to, studentName, subjectName, date, status) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Attendance Notification for ${studentName}`,
        text: `Hello,\n\nThis is to notify you that ${studentName} was marked ${status} for ${subjectName || "their class"} on ${new Date(date).toLocaleDateString()}.\n\nIf you have any questions, please contact the teacher.\n\nRegards,\nSchool Administration`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Attendance email sent to ${to} for ${studentName}`);
    } catch (error) {
        console.error('Error sending attendance email:', error);
    }
};

export const sendOTPEmail = async (to, userName, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `🔐 Your Login OTP - Attendance Management System`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
                <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Two-Factor Authentication</h1>
                    <p style="color: #888; margin-top: 8px; font-size: 14px;">Attendance Management System</p>
                </div>
                <div style="padding: 32px; text-align: center;">
                    <p style="color: #ccc; font-size: 16px; margin-bottom: 8px;">Hello <strong style="color: #fff;">${userName}</strong>,</p>
                    <p style="color: #999; font-size: 14px; margin-bottom: 24px;">Your one-time verification code is:</p>
                    <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4ade80; font-family: 'Courier New', monospace;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 13px; margin-top: 24px;">⏰ This code expires in <strong style="color: #f59e0b;">5 minutes</strong></p>
                    <p style="color: #555; font-size: 12px; margin-top: 16px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="background: #111; padding: 16px; text-align: center; border-top: 1px solid #222;">
                    <p style="color: #444; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Attendance Management System</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${to}`);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};
