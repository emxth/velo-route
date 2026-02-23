import * as bookingRepo from "../repositories/bookingRepository.js";
import logger from "../config/logger.js";
import { sendSMS } from "../services/notificationService.js";
import { refundPayment } from "./paymentService.js";

/*
 Service Layer = Business rules
 Handles validation, vehicle-specific rules, and interacts with repository
*/

export const createBooking = async (userId, data) => {
  const { transportType, seatNumbers, coachNumber, phoneNumber, tripId } = data;

  // ---------------- Validation ----------------
  if (!phoneNumber) {
    throw new Error("Phone number is required for booking");
  }

  const phoneRegex = /^\+94\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new Error("Invalid phone number format. Use +94XXXXXXXXX");
  }

  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new Error("At least one seat must be selected");
  }

  if (!transportType || !tripId) {
    throw new Error("Missing booking details");
  }

  const seatCount = seatNumbers.length;

  // ---------------- Transport Rules ----------------
  if (transportType === "TRAIN" && !coachNumber) {
    throw new Error("Train booking requires coach number");
  }

  if (transportType === "BUS" && coachNumber) {
    throw new Error("Bus booking should not include coach number");
  }

  // ---------------- Seat Conflict Check ----------------
  const existingBookings = await bookingRepo.findConflictingSeats(
    tripId,
    seatNumbers
  );

  if (existingBookings.length > 0) {
    throw new Error("One or more selected seats already booked");
  }

  // ---------------- Price Calculation ----------------
  /*
    Price must NEVER come from frontend.
    This should later call Routing/Schedule module.
  */
  const pricePerSeat = 500; // later Replace with transport module API

  const totalAmount = pricePerSeat * seatCount;

  // ---------------- Create Booking ----------------
  const booking = await bookingRepo.create({
    passenger: userId,
    transportType,
    tripId,
    seatNumbers,
    seatCount,        
    coachNumber,
    phoneNumber,
    fromLocation: data.fromLocation,
    toLocation: data.toLocation,
    departureTime: data.departureTime,
    amount: totalAmount, 
    bookingStatus: "PENDING",
    paymentStatus: "UNPAID",
  });

  logger.info(`Booking created: ${booking._id} by user ${userId}`);
  return booking;
};

export const getMyBookings = (userId) => bookingRepo.findByPassenger(userId);

export const getAllBookings = () => bookingRepo.findAll();

/*
 Cancels a booking.
 If payment already completed → trigger refund automatically.
*/
export const cancelBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) throw new Error("Booking not found");

  // Ensure only owner can cancel
  if (booking.passenger.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  /*
   Refund only if payment already completed.
  */
  if (booking.paymentStatus === "PAID") {
    await refundPayment(booking.paymentIntentId);
    booking.paymentStatus = "REFUNDED";
  }

  booking.bookingStatus = "CANCELLED";

  // await bookingRepo.update(booking);
  await booking.save();

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

/*
 Update booking fields: seatNumbers, phoneNumber, departureTime
 Only allowed if booking is still PENDING
 SeatCount and Amount are recalculated automatically
*/
export const updateBooking = async (bookingId, userId, data) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  // Only owner can update
  if (booking.passenger.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  // Only PENDING bookings can be updated
  if (booking.bookingStatus !== "PENDING") {
    throw new Error("Only pending bookings can be updated");
  }

  const { seatNumbers, phoneNumber, departureTime } = data;

  // ---------------- Phone validation ----------------
  if (phoneNumber) {
    const phoneRegex = /^\+94\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error("Invalid phone number format. Use +94XXXXXXXXX");
    }
    booking.phoneNumber = phoneNumber;
  }

  // ---------------- Seat update ----------------
  if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
    // Check for seat conflicts
    const existingBookings = await bookingRepo.findConflictingSeats(
      booking.tripId,
      seatNumbers
    );

    // Ignore current booking seats in conflict check
    const conflictingSeats = existingBookings.filter(
      (b) => b._id.toString() !== bookingId
    );

    if (conflictingSeats.length > 0) {
      throw new Error("One or more selected seats already booked");
    }

    booking.seatNumbers = seatNumbers;
    booking.seatCount = seatNumbers.length;

    // Recalculate amount (backend price per seat)
    const pricePerSeat = 500; // TODO: fetch dynamically from transport module
    booking.amount = pricePerSeat * booking.seatCount;
  }

  // ---------------- Departure time ----------------
  if (departureTime) {
    booking.departureTime = new Date(departureTime);
  }

  await booking.save();
  logger.info(`Booking updated: ${booking._id} by user ${userId}`);

  return booking;
};
