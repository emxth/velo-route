import * as bookingService from "../services/bookingService.js";
import logger from "../config/logger.js";

/*
 Controller layer handles HTTP requests
 No business rules here
*/

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json(booking);
  } catch (err) {
    logger.error(`Booking creation failed: ${err.message}`);
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user._id);
    res.json(bookings);
  } catch (err) { next(err); }
};

export const getOccupiedSeats = async (req, res, next) => {
  try {
    const occupiedSeats = await bookingService.getOccupiedSeats({
      tripId: req.query.tripId,
      transportType: req.query.transportType,
      fromLocation: req.query.fromLocation,
      toLocation: req.query.toLocation,
      departureTime: req.query.departureTime,
      coachNumber: req.query.coachNumber,
      excludeBookingId: req.query.excludeBookingId,
    });

    res.json({ occupiedSeats });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (_req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (err) { next(err); }
};

export const updateBookingController = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBooking(
      req.params.id,
      req.user._id,
      req.body
    );
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
    res.json(booking);
  } catch (err) { next(err); }
};

// Start Payment
export const payBooking = async (req, res, next) => {
  try {
    const session = await bookingService.startPayment(req.params.id, req.user._id);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (err) {
    next(err);
  }
};

// Passenger confirms payment after Stripe redirect
export const confirmPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const booking = await bookingService.confirmPayment(
      req.params.id,
      req.user._id,
      sessionId
    );

    res.json(booking);
  } catch (err) {
    logger.error(`Payment confirmation failed: ${err.message}`);
    next(err);
  }
};

// Admin confirms booking (payment already validated in service)
export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(req.params.id);

    res.json(booking);

  } catch (err) {
    logger.error(`Booking confirmation failed: ${err.message}`);
    next(err);
  }
};

export const deleteBookingController = async (req, res, next) => {
  try {
    const result = await bookingService.deleteBooking(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const clearBookingHistoryController = async (req, res, next) => {
  try {
    const result = await bookingService.clearBookingHistory(req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const adminRejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.adminRejectBooking(req.params.id, req.user._id, reason);
    res.json(booking);
  } catch (err) {
    logger.error(`Admin booking rejection failed: ${err.message}`);
    next(err);
  }
};

export const adminCancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.adminCancelBooking(req.params.id, req.user._id, reason);
    res.json(booking);
  } catch (err) {
    logger.error(`Admin booking cancellation failed: ${err.message}`);
    next(err);
  }
};