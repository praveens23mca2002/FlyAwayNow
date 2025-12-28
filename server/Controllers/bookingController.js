const Booking = require("../models/bookingsModel");
const Bus = require("../models/busModel");
const User = require("../models/usersModel");
const stripe = require("stripe")('sk_test_51QyVsmP8gkHsfJwVX5si08ILaO4wGU63EgdEPszRPIKqkrwr5ws9f7K9EnU7pTSgiLVk746uf6eNKO2FRhLruNNF001RanTYQf');
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require("moment");

// nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const BookSeat = async (req, res) => {
  try {
    console.log("Received booking request:", req.body);

    const newBooking = new Booking({
      ...req.body,
      user: req.params.userId,
      isCancelled: false
    });

    await newBooking.save();

    const bus = await Bus.findById(req.body.bus);
    if (!bus) {
      return res.status(404).send({
        message: "Bus not found",
        success: false,
      });
    }

    bus.seatsBooked = [...bus.seatsBooked, ...req.body.seats];
    await bus.save();

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // Send email to user with the booking details
    let mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #7c3aed, #2563eb); padding: 20px; color: white; text-align: center;">
            <h2 style="margin: 0;">Booking Confirmed</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${user.name},</p>
            <p>Your booking details are as follows:</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <p><strong>Bus:</strong> ${bus.name} (${bus.busNumber})</p>
              <p><strong>From:</strong> ${bus.from}</p>
              <p><strong>To:</strong> ${bus.to}</p>
              <p><strong>Seats:</strong> ${req.body.seats.join(", ")}</p>
              <p><strong>Departure Time:</strong> ${moment(bus.departure, "HH:mm:ss").format("hh:mm A")}</p>
              <p><strong>Arrival Time:</strong> ${moment(bus.arrival, "HH:mm:ss").format("hh:mm A")}</p>
              <p><strong>Journey Date:</strong> ${bus.journeyDate}</p>
              <p><strong>Type:</strong> ${bus.ac ? "AC" : "Non-AC"}</p>
              <p><strong>Total Price:</strong> ₹${bus.price * req.body.seats.length}</p>
            </div>
            
            <p style="margin-top: 20px;">Thank you for choosing our service!</p>
          </div>
          <div style="background: linear-gradient(to right, #7c3aed, #2563eb); padding: 10px; color: white; text-align: center; font-size: 12px;">
            <p>Please present this confirmation at the boarding point</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Confirmation email sent");
      }
    });

    res.status(200).send({
      message: "Seat booked successfully",
      data: newBooking,
      success: true,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).send({
      message: "Booking failed",
      data: error,
      success: false,
    });
  }
};

const GetAllBookings = async (req, res) => {
  try {
    const { showCancelled } = req.query;
    let query = {};

    if (showCancelled === 'true') {
      query.isCancelled = true;
    } else if (showCancelled === 'false') {
      query.isCancelled = false;
    }

    const bookings = await Booking.find(query)
      .populate("bus")
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).send({
      message: "Bookings fetched successfully",
      data: bookings,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send({
      message: "Failed to get bookings",
      data: error,
      success: false,
    });
  }
};

const GetAllBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.user_Id })
      .populate("bus")
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).send({
      message: "Bookings fetched successfully",
      data: bookings,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Bookings fetch failed",
      data: error,
      success: false,
    });
  }
};

const CancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id).populate('user').populate('bus');
    
    if (!booking) {
      return res.status(404).send({
        message: "Booking not found",
        success: false,
      });
    }

    if (booking.isCancelled) {
      return res.status(400).send({
        message: "This booking has already been cancelled",
        success: false,
      });
    }

    // Update the booking to mark it as cancelled
    booking.isCancelled = true;
    await booking.save();

    // Update the bus's seatsBooked array
    const bus = await Bus.findById(booking.bus._id);
    bus.seatsBooked = bus.seatsBooked.filter(
      (seat) => !booking.seats.includes(seat)
    );
    await bus.save();

    // Send cancellation email
    let mailOptions = {
      from: process.env.EMAIL,
      to: booking.user.email,
      subject: "Booking Cancellation Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 20px; color: white; text-align: center;">
            <h2 style="margin: 0;">Booking Cancelled</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${booking.user.name},</p>
            <p>Your booking has been successfully cancelled. Here are the details:</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <p><strong>Bus:</strong> ${bus.name} (${bus.busNumber})</p>
              <p><strong>Seats:</strong> ${booking.seats.join(", ")}</p>
              <p><strong>Journey Date:</strong> ${bus.journeyDate}</p>
              <p><strong>Cancellation Time:</strong> ${moment().format("DD/MM/YYYY hh:mm A")}</p>
              <p><strong>Refund Amount:</strong> ₹${bus.price * booking.seats.length}</p>
            </div>
            
            <p style="margin-top: 20px;">We hope to serve you again in the future!</p>
          </div>
          <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 10px; color: white; text-align: center; font-size: 12px;">
            <p>Your refund will be processed within 5-7 business days</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.error("Error sending cancellation email:", err);
      } else {
        console.log("Cancellation email sent");
      }
    });

    res.status(200).send({
      message: "Booking cancelled successfully",
      data: booking,
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send({
      message: "Booking cancellation failed",
      data: error,
      success: false,
    });
  }
};

const PayWithStripe = async (req, res) => {
  try {
    const { token, amount } = req.body;
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    const payment = await stripe.charges.create(
      {
        amount: amount * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
      },
      {
        idempotencyKey: uuidv4(),
      }
    );

    if (payment) {
      res.status(200).send({
        message: "Payment successful",
        data: {
          transactionId: payment.source.id,
        },
        success: true,
        amount: payment.amount,
      });
    } else {
      res.status(500).send({
        message: "Payment failed",
        data: error,
        success: false,
        amount: payment.amount,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Payment failed",
      data: error,
      success: false,
    });
  }
};

module.exports = {
  BookSeat,
  GetAllBookings,
  GetAllBookingsByUser,
  CancelBooking,
  PayWithStripe,
};