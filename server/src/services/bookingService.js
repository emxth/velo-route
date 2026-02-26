import * as bookingRepo from "../repositories/bookingRepository.js";
import logger from "../config/logger.js";
import { sendSMS } from "../services/notificationService.js";
import { refundPayment } from "./paymentService.js";
import { ApiError } from "../utils/apiError.js";

/*
  Service Layer = Business rules
  Handles validation, transport rules, and repository interaction
*/

export const createBooking = async (userId, data) => {
  const { transportType, seatNumbers, coachNumber, phoneNumber, tripId } = data;

  // ---------------- Validation ----------------
  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required for booking");
  }

  const phoneRegex = /^\+94\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    throw new ApiError(400, "Invalid phone number format. Use +94XXXXXXXXX");
  }

  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new ApiError(400, "At least one seat must be selected");
  }

  if (!transportType || !tripId) {
    throw new ApiError(400, "Missing booking details");
  }

  if (transportType === "TRAIN" && !coachNumber) {
    throw new ApiError(400, "Train booking requires coach number");
  }

  if (transportType === "BUS" && coachNumber) {
    throw new ApiError(400, "Bus booking should not include coach number");
  }

  // ---------------- Seat Conflict Check ----------------
  const existingBookings = await bookingRepo.findConflictingSeats(
    tripId,
    seatNumbers
  );

  if (existingBookings.length > 0) {
    throw new ApiError(400, "One or more selected seats already booked");
  }

  const seatCount = seatNumbers.length;
  const pricePerSeat = 500; // TODO: Replace with transport module API
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

export const getMyBookings = (userId) =>
  bookingRepo.findByPassenger(userId);

export const getAllBookings = () =>
  bookingRepo.findAll();

/*
  Cancel booking.
  If payment already completed trigger refund.
*/
export const cancelBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.passenger.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.paymentStatus === "PAID") {
    await refundPayment(booking.paymentIntentId);
    booking.paymentStatus = "REFUNDED";
  }

  booking.bookingStatus = "CANCELLED";
  await booking.save();

  logger.info(`Booking cancelled: ${booking._id} by user ${userId}`);
  return booking;
};

/*
  Confirm booking and mark payment as completed
*/
export const confirmBooking = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  booking.bookingStatus = "CONFIRMED";
  booking.paymentStatus = "PAID";
  await booking.save();

  try {
    await sendSMS(
      booking.phoneNumber,
      `Your ${booking.transportType} booking on ${booking.departureTime} is CONFIRMED!`
    );
  } catch (err) {
    logger.error(
      `Failed to send SMS for booking ${booking._id}: ${err.message}`
    );
  }

  return booking;
};

/*
  Update booking (only if PENDING)
*/
export const updateBooking = async (bookingId, userId, data) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.passenger.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.bookingStatus !== "PENDING") {
    throw new ApiError(400, "Only pending bookings can be updated");
  }

  const { seatNumbers, phoneNumber, departureTime } = data;

  // ---------------- Phone Update ----------------
  if (phoneNumber) {
    const phoneRegex = /^\+94\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new ApiError(400, "Invalid phone number format. Use +94XXXXXXXXX");
    }
    booking.phoneNumber = phoneNumber;
  }

  // ---------------- Seat Update ----------------
  if (seatNumbers && Array.isArray(seatNumbers) && seatNumbers.length > 0) {
    const existingBookings = await bookingRepo.findConflictingSeats(
      booking.tripId,
      seatNumbers
    );

    const conflictingSeats = existingBookings.filter(
      (b) => b._id.toString() !== bookingId
    );

    if (conflictingSeats.length > 0) {
      throw new ApiError(400, "One or more selected seats already booked");
    }

    booking.seatNumbers = seatNumbers;
    booking.seatCount = seatNumbers.length;

    const pricePerSeat = 500;
    booking.amount = pricePerSeat * booking.seatCount;
  }

  // ---------------- Departure Time ----------------
  if (departureTime) {
    booking.departureTime = new Date(departureTime);
  }

  await booking.save();

  logger.info(`Booking updated: ${booking._id} by user ${userId}`);
  return booking;
};

/*
  Delete booking (only if CANCELLED)
*/
export const deleteBooking = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.passenger.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.bookingStatus !== "CANCELLED") {
    throw new ApiError(
      400,
      "Cannot delete a confirmed booking. Cancel it first."
    );
  }

  await bookingRepo.deleteById(bookingId);

  return { message: "Booking deleted successfully" };
};

/*
  Clear cancelled booking history
*/
export const clearBookingHistory = async (userId) => {
  await bookingRepo.deleteManyByPassenger(userId);
  return { message: "Cancelled booking history cleared" };
};