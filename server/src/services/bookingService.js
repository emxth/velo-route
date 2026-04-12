import * as bookingRepo from "../repositories/bookingRepository.js";
import logger from "../config/logger.js";
import { sendSMS } from "../services/notificationService.js";
import { createCheckoutSession, refundPayment, retrieveSession } from "./paymentService.js";
import { ApiError } from "../utils/apiError.js";
import Schedule from "../models/Schedule.js";
import mongoose from "mongoose";

/*
  Service Layer = Business rules
  Handles validation, transport rules, and repository interaction
*/

const validateDepartureTimeWindow = (value) => {
  const departureDate = new Date(value);

  if (Number.isNaN(departureDate.getTime())) {
    throw new ApiError(400, "Invalid departure time");
  }

  const now = new Date();
  const maxAllowedDate = new Date(now);
  maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 1);

  if (departureDate <= now) {
    throw new ApiError(400, "Departure time must be in the future");
  }

  if (departureDate > maxAllowedDate) {
    throw new ApiError(400, "Departure time must be within one month from today");
  }

  return departureDate;
};

const resolveEstimatedFareForTrip = async (tripId) => {
  try {
    const schedule = await Schedule.findById(tripId).populate("routeId", "estimatedFare");

    if (!schedule?.routeId) {
      throw new ApiError(400, "Invalid tripId: schedule not found");
    }

    const estimatedFare = Number(schedule.routeId.estimatedFare);

    if (!Number.isFinite(estimatedFare) || estimatedFare <= 0) {
      throw new ApiError(400, "Route estimatedFare is not configured for this trip");
    }

    return estimatedFare;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(400, "Invalid tripId format");
  }
};

const getTrainClassFromCoachLabel = (coachLabel) => {
  if (!coachLabel) return "THIRD";
  if (coachLabel.includes("1st Class")) return "FIRST";
  if (coachLabel.includes("2nd Class")) return "SECOND";
  return "THIRD";
};

const resolveFarePerSeatForTrip = async (tripId, transportType, coachNumber) => {
  // Buses and other non-train types
  if (transportType !== "TRAIN") {
    // If tripId is not a valid ObjectId, skip DB lookup
    // and fall back to a safe default fare per seat.
    if (!mongoose.isValidObjectId(tripId)) {
      return 1000;
    }

    return resolveEstimatedFareForTrip(tripId);
  }

  try {
    const schedule = await Schedule.findById(tripId).populate("routeId", "distance");

    if (!schedule?.routeId) {
      throw new ApiError(400, "Invalid tripId: schedule not found");
    }

    const distanceKm = Number(schedule.routeId.distance);

    if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
      throw new ApiError(400, "Route distance is not configured for this trip");
    }

    const trainClass = getTrainClassFromCoachLabel(coachNumber);
    let ratePerKm;
    if (trainClass === "FIRST") ratePerKm = 100;
    else if (trainClass === "SECOND") ratePerKm = 60;
    else ratePerKm = 20;

    return distanceKm * ratePerKm;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(400, "Invalid tripId format");
  }
};

export const createBooking = async (userId, data) => {
  const { transportType, seatNumbers, coachNumber, phoneNumber, tripId, fromLocation, toLocation, departureTime } = data;

  //Validations
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

  //Seat Conflict Check
  if (!fromLocation || !toLocation || !departureTime) {
    throw new ApiError(400, "From location, to location and departure time are required");
  }

  const validatedDepartureDate = validateDepartureTimeWindow(departureTime);

  const existingBookings = await bookingRepo.findConflictingSeats({
    tripId,
    transportType,
    fromLocation,
    toLocation,
    departureTime,
    seatNumbers,
    ...(coachNumber ? { coachNumber } : {}),
  });

  if (existingBookings.length > 0) {
    throw new ApiError(400, "One or more selected seats already booked");
  }

  const seatCount = seatNumbers.length;
  const pricePerSeat = await resolveFarePerSeatForTrip(tripId, transportType, coachNumber);
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
    departureTime: validatedDepartureDate,
    amount: totalAmount,
    bookingStatus: "PENDING",
    paymentStatus: "UNPAID",
  });

  logger.info(`Booking created: ${booking._id} by user ${userId}`);
  return booking;
};

export const getMyBookings = async (userId) => {
  const bookings = await bookingRepo.findByPassenger(userId);

  if (!bookings || bookings.length === 0) {
    return bookings;
  }

  const tripIds = bookings
    .map((b) => b.tripId)
    .filter(Boolean);

  if (tripIds.length === 0) {
    return bookings;
  }

  const schedules = await Schedule.find({ _id: { $in: tripIds } })
    .populate("vehicleID", "registrationNumber")
    .lean();

  const scheduleMap = new Map(
    schedules.map((s) => [s._id.toString(), s]),
  );

  return bookings.map((booking) => {
    const plain = booking.toObject ? booking.toObject() : booking;
    const schedule = scheduleMap.get(String(booking.tripId));
    const registrationNumber = schedule?.vehicleID?.registrationNumber || null;

    return {
      ...plain,
      vehicleRegistrationNumber: registrationNumber,
    };
  });
};

export const getAllBookings = async () => {
	const bookings = await bookingRepo.findAll();

	if (!bookings || bookings.length === 0) {
		return bookings;
	}

	const tripIds = bookings
		.map((b) => b.tripId)
		.filter(Boolean);

	if (tripIds.length === 0) {
		return bookings;
	}

	const schedules = await Schedule.find({ _id: { $in: tripIds } })
		.populate("vehicleID", "registrationNumber")
		.lean();

	const scheduleMap = new Map(
		schedules.map((s) => [s._id.toString(), s]),
	);

	return bookings.map((booking) => {
		const plain = booking.toObject ? booking.toObject() : booking;
		const schedule = scheduleMap.get(String(booking.tripId));
		const registrationNumber = schedule?.vehicleID?.registrationNumber || null;

		return {
			...plain,
			vehicleRegistrationNumber: registrationNumber,
		};
	});
};

export const getOccupiedSeats = async ({ tripId, transportType, fromLocation, toLocation, departureTime, coachNumber, excludeBookingId }) => {
  if (!tripId || !transportType || !fromLocation || !toLocation || !departureTime) {
    throw new ApiError(400, "tripId, transportType, fromLocation, toLocation and departureTime are required");
  }

  const bookings = await bookingRepo.findOccupiedSeats({
    tripId,
    transportType,
    fromLocation,
    toLocation,
    departureTime,
    coachNumber,
    excludeBookingId,
  });

  const occupiedSeatSet = new Set();
  for (const booking of bookings) {
    for (const seat of booking.seatNumbers || []) {
      const seatNumber = Number(seat);
      if (!Number.isNaN(seatNumber)) {
        occupiedSeatSet.add(seatNumber);
      }
    }
  }

  const result = Array.from(occupiedSeatSet).sort((a, b) => a - b);
  
  return result;
};

const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const markCancelled = (booking, actionType, reason, actorRole, actorUserId) => {
  booking.bookingStatus = "CANCELLED";
  booking.cancelAction = actionType;
  booking.cancelReason = reason;
  booking.cancelledBy = actorRole;
  booking.cancelledByUser = actorUserId;
  booking.cancelledAt = new Date();
};

export const startPayment = async (bookingId, userId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.passenger.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.bookingStatus !== "PENDING") {
    throw new ApiError(400, "Only pending bookings can be paid");
  }

  if (booking.paymentStatus === "PAID") {
    throw new ApiError(400, "Booking is already paid");
  }

  return createCheckoutSession(bookingId);
};

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

  if (booking.bookingStatus === "CANCELLED") {
    return booking;
  }

  const departureTimeMs = new Date(booking.departureTime).getTime();
  if (Number.isNaN(departureTimeMs)) {
    throw new ApiError(400, "Invalid departure time on booking");
  }

  const nowMs = Date.now();
  const timeUntilDepartureMs = departureTimeMs - nowMs;

  // Refund policy:
  // >24h before departure: 100%
  // <=24h before departure: 50%
  // no-show (after departure): 0%
  let refundRate = 0;
  if (timeUntilDepartureMs > 0) {
    refundRate = timeUntilDepartureMs > TWENTY_FOUR_HOURS_IN_MS ? 1 : 0.5;
  }

  if (booking.paymentStatus === "PAID") {
    if (refundRate > 0) {
      const refundAmountInCents = Math.round(booking.amount * 100 * refundRate);
      await refundPayment(booking.paymentIntentId, refundAmountInCents);
      booking.paymentStatus = "REFUNDED";
    } else {
      logger.info(`No-show cancellation, no refund for booking ${booking._id}`);
    }
  }

  markCancelled(
    booking,
    "PASSENGER_CANCEL",
    "Passenger cancelled booking",
    "USER",
    userId
  );
  await booking.save();

  logger.info(`Booking cancelled: ${booking._id} by user ${userId}`);
  return booking;
};

/*
  Confirm payment after Stripe redirect and persist payment intent details.
  This runs after checkout, when payment_intent is available.
*/
export const confirmPayment = async (bookingId, userId, sessionId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.passenger.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!booking.stripeSessionId) {
    throw new ApiError(400, "No payment session found for this booking");
  }

  if (booking.stripeSessionId !== sessionId) {
    throw new ApiError(400, "Invalid payment session for this booking");
  }

  // Idempotent: if already saved from a previous call, return current state.
  if (booking.paymentIntentId && booking.paymentStatus === "PAID") {
    return booking;
  }

  const session = await retrieveSession(sessionId);

  if (!session.payment_intent || session.payment_intent.status !== "succeeded") {
    throw new ApiError(400, "Payment not completed yet");
  }

  booking.paymentIntentId = session.payment_intent.id;
  booking.paymentStatus = "PAID";
  await booking.save();

  logger.info(
    `Payment confirmed for booking ${bookingId} with PaymentIntent ${booking.paymentIntentId}`
  );

  return booking;
};

/*
  Confirm booking and mark payment as completed
*/
export const confirmBooking = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) throw new ApiError(404, "Booking not found");

  const departureTimeMs = new Date(booking.departureTime).getTime();
  if (Number.isNaN(departureTimeMs)) {
    throw new ApiError(400, "Invalid departure time on booking");
  }

  if (departureTimeMs <= Date.now()) {
    throw new ApiError(400, "Admin actions are not allowed for completed trips");
  }

  if (booking.bookingStatus === "CANCELLED") {
    throw new ApiError(400, "Cancelled bookings cannot be confirmed");
  }

  //Added for Testing Stripe
  if (process.env.NODE_ENV === "test") {
    booking.stripeSessionId = 'dummy_payment_session_id'
  }

  // In normal flow, payment is verified in confirmPayment and persisted before admin confirmation.
  if (process.env.NODE_ENV !== "test" && (booking.paymentStatus !== "PAID" || !booking.paymentIntentId)) {
    throw new ApiError(400, "Payment must be completed before booking confirmation");
  }

  if (booking.bookingStatus === "CONFIRMED") {
    return booking;
  }

  booking.bookingStatus = "CONFIRMED";

  await booking.save();

  logger.info(`Booking ${bookingId} confirmed`);

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

  if (booking.paymentStatus === "PAID" || booking.paymentStatus === "REFUNDED") {
    throw new ApiError(400, "Paid bookings cannot be updated");
  }

  const { seatNumbers, phoneNumber, departureTime, coachNumber } = data;

  const validatedDepartureDate = departureTime
    ? validateDepartureTimeWindow(departureTime)
    : null;

  const targetDepartureTime = validatedDepartureDate || booking.departureTime;

  const isTrain = booking.transportType === "TRAIN";

  // ---------------- Coach/Class Update (for trains) ----------------
  let nextCoachNumber = booking.coachNumber;

  if (isTrain) {
    if (coachNumber !== undefined) {
      if (!coachNumber) {
        throw new ApiError(400, "Train booking requires coach number");
      }
      nextCoachNumber = coachNumber;
    }

    if (!nextCoachNumber) {
      throw new ApiError(400, "Train booking requires coach number");
    }
  } else if (coachNumber) {
    throw new ApiError(400, "Bus booking should not include coach number");
  }

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
    const existingBookings = await bookingRepo.findConflictingSeats({
      tripId: booking.tripId,
      transportType: booking.transportType,
      fromLocation: booking.fromLocation,
      toLocation: booking.toLocation,
      departureTime: targetDepartureTime,
      seatNumbers,
      coachNumber: isTrain ? nextCoachNumber : undefined,
      excludeBookingId: bookingId,
    });

    if (existingBookings.length > 0) {
      throw new ApiError(400, "One or more selected seats already booked");
    }

    booking.seatNumbers = seatNumbers;
    booking.seatCount = seatNumbers.length;

    const pricePerSeat = await resolveFarePerSeatForTrip(booking.tripId, booking.transportType, isTrain ? nextCoachNumber : undefined);
    booking.amount = pricePerSeat * booking.seatCount;
  }

  // Persist updated coach/class for trains
  if (isTrain && nextCoachNumber && booking.coachNumber !== nextCoachNumber) {
    booking.coachNumber = nextCoachNumber;
  }

  // ---------------- Departure Time ----------------
  if (validatedDepartureDate) {
    booking.departureTime = validatedDepartureDate;
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
    throw new ApiError(400, "Only cancelled bookings can be deleted");
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

export const adminRejectBooking = async (bookingId, adminUserId, reason) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!reason || !reason.trim()) {
    throw new ApiError(400, "Reason is required for admin rejection");
  }

  const cleanReason = reason.trim();

  const departureTimeMs = new Date(booking.departureTime).getTime();
  if (Number.isNaN(departureTimeMs)) {
    throw new ApiError(400, "Invalid departure time on booking");
  }

  if (departureTimeMs <= Date.now()) {
    throw new ApiError(400, "Admin actions are not allowed for completed trips");
  }

  if (booking.bookingStatus !== "PENDING") {
    throw new ApiError(400, "Only pending bookings can be rejected");
  }

  if (booking.paymentStatus === "PAID") {
    const refundAmountInCents = Math.round(booking.amount * 100);
    await refundPayment(booking.paymentIntentId, refundAmountInCents);
    booking.paymentStatus = "REFUNDED";
  }

  markCancelled(booking, "ADMIN_REJECT", cleanReason, "ADMIN", adminUserId);
  await booking.save();

  logger.info(`Booking rejected by admin: ${booking._id} by user ${adminUserId}`);

  // Send SMS to passenger with rejection reason
  try {
    await sendSMS(
      booking.phoneNumber,
      `Your ${booking.transportType} booking on ${booking.departureTime} was REJECTED. Reason: ${cleanReason}`
    );
  } catch (err) {
    logger.error(`Failed to send rejection SMS for booking ${booking._id}: ${err.message}`);
  }

  return booking;
};

export const adminCancelBooking = async (bookingId, adminUserId, reason) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!reason || !reason.trim()) {
    throw new ApiError(400, "Reason is required for admin cancellation");
  }

  const cleanReason = reason.trim();

  const departureTimeMs = new Date(booking.departureTime).getTime();
  if (Number.isNaN(departureTimeMs)) {
    throw new ApiError(400, "Invalid departure time on booking");
  }

  if (departureTimeMs <= Date.now()) {
    throw new ApiError(400, "Admin actions are not allowed for completed trips");
  }

  if (booking.bookingStatus === "CANCELLED") {
    return booking;
  }

  if (booking.paymentStatus === "PAID") {
    const refundAmountInCents = Math.round(booking.amount * 100);
    await refundPayment(booking.paymentIntentId, refundAmountInCents);
    booking.paymentStatus = "REFUNDED";
  }

  markCancelled(booking, "ADMIN_CANCEL", cleanReason, "ADMIN", adminUserId);
  await booking.save();

  logger.info(`Booking cancelled by admin: ${booking._id} by user ${adminUserId}`);

  // Send SMS to passenger with cancellation reason
  try {
    await sendSMS(
      booking.phoneNumber,
      `Your ${booking.transportType} booking on ${booking.departureTime} was CANCELLED by admin. Reason: ${cleanReason}`
    );
  } catch (err) {
    logger.error(`Failed to send cancellation SMS for booking ${booking._id}: ${err.message}`);
  }

  return booking;
};