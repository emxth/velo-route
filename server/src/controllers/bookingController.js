import * as bookingService from "../services/bookingService.js";
import { createCheckoutSession, retrieveSession } from "../services/paymentService.js";
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
    const session = await createCheckoutSession(req.params.id);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (err) {
    next(err);
  }
};

// Confirm Payment (NEW CORRECT VERSION)
export const confirmBooking = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required"
      });
    }

    // Retrieve session from Stripe
    const session = await retrieveSession(sessionId);

    if (!session.payment_intent) {
      return res.status(400).json({
        message: "Payment not completed yet"
      });
    }

    // Delegate update to booking service
    const booking = await bookingService.confirmBooking(
      req.params.id,
      session.payment_intent
    );

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