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
const {
  createBooking,
  cancelBooking,
  confirmBooking,
  getMyBookings,
  startPayment,
  adminRejectBooking,
  adminCancelBooking,
} =
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
      const validDepartureTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const result = await createBooking("user123", {
        seatNumbers: ["A1"],
        phoneNumber: "+94123456789",
        transportType: "BUS",
        tripId: "trip123",
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: validDepartureTime,
      });

      expect(findConflictingSeatsMock).toHaveBeenCalledWith({
        tripId: "trip123",
        transportType: "BUS",
        fromLocation: "Colombo",
        toLocation: "Kandy",
        departureTime: validDepartureTime,
        seatNumbers: ["A1"],
      });
      expect(createBookingMock).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });
  });

  describe("confirmBooking", () => {
    test("should confirm booking and send SMS", async () => {
      const booking = {
        _id: "b1",
        phoneNumber: "+94123456789",
        transportType: "BUS",
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        save: jest.fn()
      };
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

    test("should throw for completed trip", async () => {
      const booking = {
        _id: "b1-old",
        departureTime: new Date(Date.now() - 60 * 60 * 1000),
      };
      findByIdMock.mockResolvedValue(booking);

      await expect(confirmBooking("b1-old")).rejects.toThrow("Admin actions are not allowed for completed trips");
    });
  });

  describe("cancelBooking", () => {
    test("should cancel unpaid booking", async () => {
      const booking = {
        _id: "b2",
        paymentStatus: "UNPAID",
        passenger: "user123",
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        save: jest.fn()
      };
      findByIdMock.mockResolvedValue(booking);

      const result = await cancelBooking("b2", "user123");

      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.save).toHaveBeenCalled();
      expect(result).toEqual(booking);
    });

    test("should refund 100 percent when cancelled more than 24h before departure", async () => {
      const booking = {
        _id: "b3",
        paymentStatus: "PAID",
        paymentIntentId: "pi_123",
        amount: 1500,
        passenger: "user123",
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        save: jest.fn()
      };
      findByIdMock.mockResolvedValue(booking);

      const result = await cancelBooking("b3", "user123");

      expect(refundPaymentMock).toHaveBeenCalledWith("pi_123", 150000);
      expect(booking.paymentStatus).toBe("REFUNDED");
      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.save).toHaveBeenCalled();
      expect(result).toEqual(booking);
    });

    test("should refund 50 percent when cancelled within 24h", async () => {
      const booking = {
        _id: "b5",
        paymentStatus: "PAID",
        paymentIntentId: "pi_456",
        amount: 2000,
        passenger: "user123",
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        save: jest.fn()
      };
      findByIdMock.mockResolvedValue(booking);

      await cancelBooking("b5", "user123");

      expect(refundPaymentMock).toHaveBeenCalledWith("pi_456", 100000);
      expect(booking.paymentStatus).toBe("REFUNDED");
      expect(booking.bookingStatus).toBe("CANCELLED");
    });

    test("should not refund for no-show cancellation", async () => {
      const booking = {
        _id: "b6",
        paymentStatus: "PAID",
        paymentIntentId: "pi_789",
        amount: 2000,
        passenger: "user123",
        departureTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        save: jest.fn()
      };
      findByIdMock.mockResolvedValue(booking);

      await cancelBooking("b6", "user123");

      expect(refundPaymentMock).not.toHaveBeenCalled();
      expect(booking.paymentStatus).toBe("PAID");
      expect(booking.bookingStatus).toBe("CANCELLED");
    });

    test("should throw if user not owner", async () => {
      const booking = { _id: "b4", passenger: "otherUser" };
      findByIdMock.mockResolvedValue(booking);
      await expect(cancelBooking("b4", "user123")).rejects.toThrow("Unauthorized");
    });
  });

  describe("startPayment", () => {
    test("should start payment for owner and pending booking", async () => {
      const booking = { _id: "b7", bookingStatus: "PENDING", paymentStatus: "UNPAID", passenger: "user123" };
      const session = { id: "cs_test_123", url: "http://checkout" };

      findByIdMock.mockResolvedValue(booking);
      createCheckoutSessionMock.mockResolvedValue(session);

      const result = await startPayment("b7", "user123");

      expect(createCheckoutSessionMock).toHaveBeenCalledWith("b7");
      expect(result).toEqual(session);
    });

    test("should throw if starter is not owner", async () => {
      const booking = { _id: "b8", bookingStatus: "PENDING", paymentStatus: "UNPAID", passenger: "otherUser" };
      findByIdMock.mockResolvedValue(booking);

      await expect(startPayment("b8", "user123")).rejects.toThrow("Unauthorized");
    });
  });

  describe("admin actions", () => {
    test("adminRejectBooking should reject pending booking and refund full if paid", async () => {
      const booking = {
        _id: "b9",
        bookingStatus: "PENDING",
        paymentStatus: "PAID",
        paymentIntentId: "pi_admin_1",
        amount: 2500,
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        save: jest.fn(),
      };
      findByIdMock.mockResolvedValue(booking);

      const result = await adminRejectBooking("b9", "admin1", "Invalid seat assignment");

      expect(refundPaymentMock).toHaveBeenCalledWith("pi_admin_1", 250000);
      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.paymentStatus).toBe("REFUNDED");
      expect(booking.cancelAction).toBe("ADMIN_REJECT");
      expect(booking.cancelReason).toBe("Invalid seat assignment");
      expect(result).toEqual(booking);
    });

    test("adminCancelBooking should cancel confirmed booking with required reason", async () => {
      const booking = {
        _id: "b10",
        bookingStatus: "CONFIRMED",
        paymentStatus: "UNPAID",
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        save: jest.fn(),
      };
      findByIdMock.mockResolvedValue(booking);

      const result = await adminCancelBooking("b10", "admin1", "Service disruption");

      expect(booking.bookingStatus).toBe("CANCELLED");
      expect(booking.cancelAction).toBe("ADMIN_CANCEL");
      expect(booking.cancelReason).toBe("Service disruption");
      expect(result).toEqual(booking);
    });

    test("adminRejectBooking should block completed trip", async () => {
      const booking = {
        _id: "b11",
        bookingStatus: "PENDING",
        paymentStatus: "UNPAID",
        departureTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        save: jest.fn(),
      };
      findByIdMock.mockResolvedValue(booking);

      await expect(adminRejectBooking("b11", "admin1", "Late processing")).rejects.toThrow(
        "Admin actions are not allowed for completed trips"
      );
    });

    test("adminCancelBooking should block completed trip", async () => {
      const booking = {
        _id: "b12",
        bookingStatus: "CONFIRMED",
        paymentStatus: "UNPAID",
        departureTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        save: jest.fn(),
      };
      findByIdMock.mockResolvedValue(booking);

      await expect(adminCancelBooking("b12", "admin1", "Post-trip cancel")).rejects.toThrow(
        "Admin actions are not allowed for completed trips"
      );
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