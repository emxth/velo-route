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
    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: {
            name: `${booking.transportType} Trip Booking`,
          },
          unit_amount: Math.round(booking.amount * 100), // important
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  // Save session ID only (paymentIntent does NOT exist yet)
  booking.stripeSessionId = session.id;
  await booking.save();

  logger.info(`Stripe session created for booking: ${bookingId}`);

  return session;
};

/*
 Refund payment using Stripe PaymentIntent.
*/
export const retrieveSession = async (stripeSessionId) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });

  if (!stripeSessionId) throw new Error("No Stripe session ID provided");

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
    expand: ["payment_intent"],
  });

  return session;
};


/*
  Refund payment using Stripe PaymentIntent.
*/
export const refundPayment = async (paymentIntentId) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-04-10" });

  if (!paymentIntentId) {
    throw new Error("No payment intent found for refund");
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });

  logger.info(`Refund issued for paymentIntent ${paymentIntentId}`);

  return refund;
};