const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.log('⚠️  No MONGODB_URI — mock data mode'); return; }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
      console.log('✅ MongoDB Connected');
      return;
    } catch (err) {
      console.error(`❌ MongoDB Error (attempt ${attempt}/${retries}):`, err.message);
      if (attempt < retries) {
        const delay = attempt * 3000;
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.log('⚠️  MongoDB connection failed after all retries — running with mock data');
};

module.exports = connectDB;
