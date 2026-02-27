// tests/unit/bookingService.test.js
import { beforeEach, describe, expect, jest } from "@jest/globals";
// At the very top of your test file
import Stripe from "stripe";

// Mock Stripe **class** fully
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "fake_session_id",
          payment_intent: { id: "fake_payment_intent_id" },
        }),
      },
    },
  }));
});


// Mock repository and external services
const createBookingMock = jest.fn();
const findByIdMock = jest.fn();
const findByPassengerMock = jest.fn();
const updateBookingMock = jest.fn();
const deleteByIdMock = jest.fn();
const findConflictingSeatsMock = jest.fn();

const createCheckoutSessionMock = jest.fn();
const refundPaymentMock = jest.fn();
const retrieveSessionMock = jest.fn();
const sendSMSMock = jest.fn();

// Mock repository
jest.unstable_mockModule("../../../src/repositories/bookingRepository.js", () => ({
  create: createBookingMock,
  findById: findByIdMock,
  findByPassenger: findByPassengerMock,
  update: updateBookingMock,
  deleteById: deleteByIdMock,
  findConflictingSeats: findConflictingSeatsMock
}));

// Mock payment & notification services
jest.unstable_mockModule("../../../src/services/paymentService.js", () => ({
  createCheckoutSession: createCheckoutSessionMock,
  refundPayment: refundPaymentMock,
  retrieveSession: retrieveSessionMock
}));

jest.unstable_mockModule("../../../src/services/notificationService.js", () => ({
  sendSMS: sendSMSMock
}));

// Import the service after mocks
const { createBooking, cancelBooking, confirmBooking, getMyBookings } =
  await import("../../../src/services/bookingService.js");

describe("Booking Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    test("should throw if phone number is missing", async () => {
      await expect(
        createBooking("user123", { seatNumbers: ["A1"], transportType: "BUS", tripId: "trip1" })
      ).rejects.toThrow("Phone number is required for booking");
    });

    test("should throw if no seats selected", async () => {
      await expect(
        createBooking("user123", { phoneNumber: "+94123456789", transportType: "BUS", tripId: "trip1" })
      ).rejects.toThrow("At least one seat must be selected");
    });

    test("should create booking successfully", async () => {
      const mockBooking = { _id: "booking123", seatNumbers: ["A1"], passenger: "user123" };
      createBookingMock.mockResolvedValue(mockBooking);
      findConflictingSeatsMock.mockResolvedValue([]);

      const result = await createBooking("user123", {
        seatNumbers: ["A1"],
        phoneNumber: "+94123456789",
        transportType: "BUS",
        tripId: "trip123"
      });

      expect(findConflictingSeatsMock).toHaveBeenCalledWith("trip123", ["A1"]);
      expect(createBookingMock).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });
  });

  describe("confirmBooking", () => {
    test("should confirm booking and send SMS", async () => {
      const booking = { _id: "b1", phoneNumber: "+94123456789", transportType: "BUS", save: jest.fn() };
      findByIdMock.mockResolvedValue(booking);

      const result = await confirmBooking("b1");

      expect(booking.save).toHaveBeenCalled();
      //expect(sendSMSMock).toHaveBeenCalledWith("+94123456789", expect.stringContaining("No payment session found for this booking"));
      expect(result).toEqual(booking);
    });

    test("should throw if booking not found", async () => {
      findByIdMock.mockResolvedValue(null);
      await expect(confirmBooking("bad-id")).rejects.toThrow("Booking not found");
    });
  });

  describe("cancelBooking", () => {
    test("should cancel unpaid booking", async () => {
      const booking = { _id: "b2", paymentStatus: "UNPAID", passenger: "user123", save: jest.fn() };
      findByIdMock.mockResolvedValue(booking);

      const result = await cancelBooking("b2", "user123");

      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.save).toHaveBeenCalled();
      expect(result).toEqual(booking);
    });

    test("should refund paid booking when cancelled", async () => {
      const booking = { _id: "b3", paymentStatus: "PAID", paymentIntentId: "pi_123", passenger: "user123", save: jest.fn() };
      findByIdMock.mockResolvedValue(booking);

      const result = await cancelBooking("b3", "user123");

      expect(refundPaymentMock).toHaveBeenCalledWith("pi_123");
      expect(booking.paymentStatus).toBe("REFUNDED");
      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.save).toHaveBeenCalled();
      expect(result).toEqual(booking);
    });

    test("should throw if user not owner", async () => {
      const booking = { _id: "b4", passenger: "otherUser" };
      findByIdMock.mockResolvedValue(booking);
      await expect(cancelBooking("b4", "user123")).rejects.toThrow("Unauthorized");
    });
  });

  describe("getMyBookings", () => {
    test("should return bookings for user", async () => {
      const mockBookings = [{ _id: "b1" }, { _id: "b2" }];
      findByPassengerMock.mockResolvedValue(mockBookings);

      const result = await getMyBookings("user123");

      expect(findByPassengerMock).toHaveBeenCalledWith("user123");
      expect(result).toEqual(mockBookings);
    });
  });
});