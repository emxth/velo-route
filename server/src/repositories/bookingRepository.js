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

const buildDepartureTimeSlotQuery = (departureTime) => {
    const slotTime = new Date(departureTime);
    if (Number.isNaN(slotTime.getTime())) {
        return null;
    }

    const slotStart = new Date(slotTime);
    slotStart.setSeconds(0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 1);

    return {
        $gte: slotStart,
        $lt: slotEnd,
    };
};

/*
 Find if requested seats already exist for this trip
*/
export const findConflictingSeats = ({ tripId, transportType, fromLocation, toLocation, departureTime, seatNumbers, excludeBookingId }) => {
    const departureTimeQuery = buildDepartureTimeSlotQuery(departureTime);
    if (!departureTimeQuery) {
        return Promise.resolve([]);
    }

    const query = {
        tripId,
        transportType,
        fromLocation,
        toLocation,
        departureTime: departureTimeQuery,
        seatNumbers: { $in: seatNumbers },
        bookingStatus: { $ne: "CANCELLED" },
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return Booking.find(query);
};

export const findOccupiedSeats = ({ tripId, transportType, fromLocation, toLocation, departureTime, excludeBookingId }) => {
    const departureTimeQuery = buildDepartureTimeSlotQuery(departureTime);
    if (!departureTimeQuery) {
        return Promise.resolve([]);
    }

    const query = {
        tripId,
        transportType,
        fromLocation,
        toLocation,
        departureTime: departureTimeQuery,
        bookingStatus: { $ne: "CANCELLED" },
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return Booking.find(query, { seatNumbers: 1, _id: 0 });
};

export const deleteById = (bookingId) => Booking.findByIdAndDelete(bookingId);

export const deleteManyByPassenger = (userId) => Booking.deleteMany({ passenger: userId, bookingStatus: "CANCELLED" });