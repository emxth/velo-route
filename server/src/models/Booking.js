import mongoose from "mongoose";

/*
 Booking Schema supports BOTH Bus and Train.
 transportType decides how the booking behaves.
*/

const bookingSchema = new mongoose.Schema(
  {
    // Who made the booking
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    // BUS or TRAIN
    transportType: {
      type: String,
      enum: ["BUS", "TRAIN"],
      required: true,
    },

    // Trip identifier from transport module
    tripId: {
      type: String,
      required: true,
    },

    // Seat number (used for both)
    seatNumber: {
      type: String,
      required: true,
    },

    // Only used when transportType = TRAIN
    coachNumber: {
      type: String,
    },

    fromLocation: {
        type: String,
        required: true
    },
    toLocation: {
        type: String,
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },

    // Payment amount
    amount: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED"],
      default: "UNPAID",
    },

    stripeSessionId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
