import Booking from "../models/Booking.js";

/*
 Repository Layer = database access only
 All CRUD for bookings is handled here
*/

export const create = (data) => Booking.create(data);

export const findById = (id) => Booking.findById(id);

export const findByPassenger = (userId) => Booking.find({ passenger: userId });

export const findAll = () => Booking.find().populate("passenger", "name email");

export const update = (booking) => booking.save();

/*
 Find if requested seats already exist for this trip
*/
export const findConflictingSeats = (tripId, seatNumbers) =>
  Booking.find({
    tripId,
    seatNumbers: { $in: seatNumbers },
    bookingStatus: { $ne: "CANCELLED" },
  });