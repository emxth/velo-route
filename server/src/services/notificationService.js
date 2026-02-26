import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";
import logger from "../config/logger.js";

const smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send SMS
export const sendSMS = async (to, message) => {
  try {
    await smsClient.messages.create({ body: message, from: process.env.TWILIO_PHONE, to });
    logger.info(`SMS sent to ${to}`);
  } catch (err) {
    console.log("TWILIO SID:", process.env.TWILIO_PHONE);
    logger.error(`Failed to send SMS: ${err.message}`);
  }
};

