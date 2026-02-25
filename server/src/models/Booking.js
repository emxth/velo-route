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

    // Multiple seats booked in one transaction
    seatNumbers: {
      type: [String], // Array of seat labels (A1, A2, etc.)
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one seat must be selected",
      },
    },

    // Total seats booked (derived from seatNumbers.length)
    seatCount: {
      type: Number,
      required: true,
      min: 1,
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
      enum: ["UNPAID", "PAID", "FAILED", "REFUNDED"],
      default: "UNPAID",
    },

    stripeSessionId: String,

    paymentIntentId: String, // REQUIRED to issue refund
  },
  { timestamps: true }
);

/*
 Prevent same seat being booked twice for the same trip.
 MongoDB will enforce uniqueness.
*/
bookingSchema.index(
  { tripId: 1, seatNumbers: 1 },
  { unique: true }
);

export default mongoose.model("Booking", bookingSchema);
