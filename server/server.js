const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const dbConfig = require("./config/dbConfig");
const feedbackRoutes = require("./routes/feedbackRoutes");

const stripeRoutes = require("./routes/stripeRoutes");
//const bookingRoutes = require("./routes/bookingsRoutes");

// Middleware
app.use(cors());
app.use(express.json());  

// Routes
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/buses", require("./routes/busesRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingsRoutes"));
app.use("/api/cities", require("./routes/citiesRoutes"));
app.use("/api/feedback", feedbackRoutes);

app.use("/api/stripe", stripeRoutes);
//app.use("/api/bookings", bookingRoutes);

// Listen to port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
