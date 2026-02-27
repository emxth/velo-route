import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as bookingController from "../controllers/bookingController.js";

const router = express.Router();

// Passenger creates booking
router.post("/", protect, authorize("user"), bookingController.createBooking);

// Passenger views own bookings
router.get("/me", protect, bookingController.getMyBookings);

// Admin views all bookings
router.get("/", protect, authorize("admin"), bookingController.getAllBookings);

// Update booking (seatNumbers, phoneNumber, departureTime)
router.patch("/:id", protect, authorize("user"), bookingController.updateBookingController);

// Cancel booking
router.patch("/:id/cancel", protect, bookingController.cancelBooking);

// Start payment
router.post("/:id/pay", protect, bookingController.payBooking);

// Confirm booking manually (for testing SMS)
router.put("/:id/confirm", protect, authorize("user"), bookingController.confirmBooking);

// Delete single booking (only if cancelled)
router.delete("/:id", protect, authorize("user"), bookingController.deleteBookingController);

// Clear all cancelled bookings
router.delete("/", protect, authorize("user"), bookingController.clearBookingHistoryController);

export default router;
