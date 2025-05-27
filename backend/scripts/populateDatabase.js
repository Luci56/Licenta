// scripts/populateDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Import the populate function
const { populateDatabase } = require('../utils/populateDatabase');

const main = async () => {
  try {
    console.log('🚀 Starting database population...');
    
    // Connect to database
    await connectDB();
    
    // Get number of patients from command line argument
    const numPatients = process.argv[2] ? parseInt(process.argv[2]) : 100;
    
    if (isNaN(numPatients) || numPatients <= 0) {
      console.error('❌ Please provide a valid number of patients');
      process.exit(1);
    }
    
    console.log(`📊 Generating ${numPatients} synthetic patients...`);
    
    // Populate database
    await populateDatabase(numPatients);
    
    console.log('✅ Database population completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during database population:', error);
    process.exit(1);
  }
};

main();