const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB conectat: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Eroare la conexiune: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
