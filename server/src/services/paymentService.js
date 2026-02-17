// import Stripe from "stripe";
// import Booking from "../models/Booking.js";
// import logger from "../config/logger.js";

// // Check Stripe key exists
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error("STRIPE_SECRET_KEY is missing. Make sure .env is loaded!");
// }

// console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// /*
//  Creates Stripe checkout session
// */

// export const createCheckoutSession = async (bookingId) => {
//   const booking = await Booking.findById(bookingId);
//   if (!booking) throw new Error("Booking not found");

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [{
//       price_data: {
//         currency: "lkr",
//         product_data: { name: `${booking.transportType} Trip Booking` },
//         unit_amount: booking.amount * 100,
//       },
//       quantity: 1,
//     }],
//     mode: "payment",
//     success_url: `${process.env.CLIENT_URL}/success`,
//     cancel_url: `${process.env.CLIENT_URL}/cancel`,
//   });

//   booking.stripeSessionId = session.id;
//   await booking.save();
//   logger.info(`Stripe session created for booking: ${bookingId}`);
//   return session;
// };

// paymentService.js
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
  });

  booking.stripeSessionId = session.id;
  await booking.save();
  logger.info(`Stripe session created for booking: ${bookingId}`);

  return session;
};
