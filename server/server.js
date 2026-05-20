require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT) || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 AutoApply Pro v3 running on port ${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api\n`);
  });
};

start().catch(err => { console.error('Startup failed:', err); process.exit(1); });
