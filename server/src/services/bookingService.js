import * as bookingRepo from "../repositories/bookingRepository.js";
import logger from "../config/logger.js";
import { sendSMS } from "../services/notificationService.js";

/*
 Service Layer = Business rules
 Handles validation, vehicle-specific rules, and interacts with repository
*/

export const createBooking = async (userId, data) => {
  const { transportType, seatNumber, coachNumber, amount, phoneNumber } = data;

  // Validation
  if (!phoneNumber) {
    throw new Error("Phone number is required for booking");
  }

  if (!transportType || !seatNumber || !amount) {
    throw new Error("Missing booking details");
  }

  const phoneRegex = /^\+94\d{9}$/;

  if (!phoneRegex.test(phoneNumber)) {
    throw new Error("Invalid phone number format. Use +94XXXXXXXXX");
  }
  
  // Transport-specific rules
  if (transportType === "TRAIN" && !coachNumber) {
    throw new Error("Train booking requires coach number");
  }
  if (transportType === "BUS" && coachNumber) {
    throw new Error("Bus booking should not include coach number");
  }

  const booking = await bookingRepo.create({ passenger: userId, ...data });
  logger.info(`Booking created: ${booking._id} by user ${userId}`);
  return booking;
};

export const getMyBookings = (userId) => bookingRepo.findByPassenger(userId);

export const getAllBookings = () => bookingRepo.findAll();

export const cancelBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.passenger.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  booking.bookingStatus = "CANCELLED";
  await bookingRepo.update(booking);
  logger.info(`Booking cancelled: ${booking._id} by user ${userId}`);
  return booking;
};

//Notification triggering after booking confirmation
export const confirmBooking = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  // Update booking/payment status
  booking.bookingStatus = "CONFIRMED";
  booking.paymentStatus = "PAID";
  await booking.save();

  // Send SMS to passenger
  try {
    await sendSMS(
      booking.phoneNumber,
      `Your ${booking.transportType} booking on ${booking.departureTime} is CONFIRMED!`
    );
  } catch (err) {
    logger.error(`Failed to send SMS for booking ${booking._id}: ${err.message}`);
  }

  return booking;
};
