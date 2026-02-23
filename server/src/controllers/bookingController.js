import * as bookingService from "../services/bookingService.js";
import { createCheckoutSession } from "../services/paymentService.js";
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

export const payBooking = async (req, res, next) => {
  try {
    const session = await createCheckoutSession(req.params.id);
    res.json({ checkoutUrl: session.url });
  } catch (err) { next(err); }
};

export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(req.params.id);
    res.json(booking);
  } catch (err) {
    logger.error(`Booking confirmation failed: ${err.message}`);
    next(err);
  }
};