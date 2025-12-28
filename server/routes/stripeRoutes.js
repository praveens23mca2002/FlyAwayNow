// const express = require("express");
// const stripe = require("stripe")('sk_test_51QyVsmP8gkHsfJwVX5si08ILaO4wGU63EgdEPszRPIKqkrwr5ws9f7K9EnU7pTSgiLVk746uf6eNKO2FRhLruNNF001RanTYQf');
// const Booking = require("../models/bookingsModel");

// const router = express.Router();

// router.post("/create-checkout-session", async (req, res) => {
//   try {
//     const { busId, userId, seats, amount } = req.body;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: `Bus Ticket` },
//             unit_amount: amount * 100, // Convert to cents
//           },
//           quantity: seats.length,
//         },
//       ],
//       mode: "payment",
//       success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
//     });

//     res.json({ success: true, sessionId: session.id });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// router.post("/confirm-payment", async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (session.payment_status === "paid") {
//       const booking = new Booking({
//         bus: req.body.busId,
//         user: req.body.userId,
//         seats: req.body.seats,
//         transactionId: session.id,
//       });

//       await booking.save();
//       return res.json({ success: true, message: "Payment successful, booking confirmed" });
//     }
    
//     res.status(400).json({ success: false, message: "Payment not found or failed" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe works in cents (multiply by 100 for INR)
      currency: "inr",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;

