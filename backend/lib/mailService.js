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
