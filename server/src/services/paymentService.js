import Stripe from "stripe";
import Booking from "../models/Booking.js";
import logger from "../config/logger.js";

export const createCheckoutSession = async (bookingId) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY missing. Check your .env!");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");

  // Prevent paying cancelled/confirmed bookings
  if (booking.bookingStatus !== "PENDING") {
    throw new Error("Only pending bookings can be paid");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "lkr",
        product_data: { name: `${booking.transportType} Trip Booking` },
        unit_amount: booking.amount * 100,
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,

    //allows us to access payment intent
    expand: ["payment_intent"],

  });

  booking.stripeSessionId = session.id;
  booking.paymentIntentId = session.payment_intent.id;

  await booking.save();
  logger.info(`Stripe session created for booking: ${bookingId}`);

  return session;
};

/*
 Refund payment using Stripe PaymentIntent.
*/

export const refundPayment = async (paymentIntentId) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  if (!paymentIntentId) {
    throw new Error("No payment intent found for refund");
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  logger.info(`Refund issued for paymentIntent ${paymentIntentId}`);

  return refund;
};