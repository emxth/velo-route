import twilio from "twilio";
import logger from "../config/logger.js";

const smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send SMS
export const sendSMS = async (to, message) => {
  try {
    await smsClient.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
    logger.info(`SMS sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send SMS: ${err.message}`);
  }
};

// Send Email
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
// });

// export const sendEmail = async (to, subject, text) => {
//   try {
//     await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
//     logger.info(`Email sent to ${to}`);
//   } catch (err) {
//     logger.error(`Failed to send Email: ${err.message}`);
//   }
// };
