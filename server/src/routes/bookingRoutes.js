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
// router.put("/:id/cancel", protect, bookingController.cancelBooking);
// router.delete("/:id/cancel", protect, cancelBooking);   
router.patch("/:id/cancel", protect, bookingController.cancelBooking);

// Start payment
router.post("/:id/pay", protect, bookingController.payBooking);

// Confirm booking manually (for testing SMS)
router.put("/:id/confirm", protect, authorize("user"), bookingController.confirmBooking);

export default router;
