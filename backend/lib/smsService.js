import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export const sendAbsentSms = async (phoneNumber, studentName, subjectName, date) => {
    if (!client || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn("Twilio SMS not configured. Skipping SMS notification.");
        return;
    }

    try {
        const formattedDate = new Date(date).toLocaleDateString();
        const messageBody = `Alert: Your child ${studentName} was marked Absent for ${subjectName} on ${formattedDate}. Please contact the school for further details.`;

        const message = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log(`Absentee SMS sent to ${phoneNumber}. SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error("Failed to send Twilio SMS:", error);
        throw error;
    }
};
