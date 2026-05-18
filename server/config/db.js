const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://job_app:j8YIfQiNFqotguUi@cluster0.m4cama4.mongodb.net/autoapply_pro?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    console.log('⚠️  Running without database - using mock data');
  }
};

module.exports = connectDB;