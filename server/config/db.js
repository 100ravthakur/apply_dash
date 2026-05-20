const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log('⚠️  No MONGODB_URI — mock data mode'); return; }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    console.log('⚠️  Running with mock data');
  }
};
module.exports = connectDB;
