const mongoose = require("mongoose");

//mongoose.connect('mongodb://127.0.0.1:27017/bus_booking_db');
mongoose.connect('mongodb+srv://root:12345@cluster-1.ro71s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-1');

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Mongo Db Connection Successful");
});

db.on("error", () => {
  console.log("Mongo Db Connection Failed");
});
