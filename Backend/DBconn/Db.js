const mongoose = require("mongoose");

const connectToMongo = async () => {
  await mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB:", err));
};

module.exports = connectToMongo;