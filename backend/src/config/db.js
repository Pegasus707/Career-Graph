const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable public DNS resolvers to handle SRV query lookups (fixes ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if setServers is restricted
}

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careergraph';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (uri !== 'mongodb://127.0.0.1:27017/careergraph') {
      try {
        console.warn(`Primary MongoDB connection failed (${err.message}). Falling back to local MongoDB...`);
        await mongoose.connect('mongodb://127.0.0.1:27017/careergraph');
        console.log('Connected to local MongoDB (mongodb://127.0.0.1:27017/careergraph)');
        return;
      } catch (localErr) {
        console.error('Local MongoDB connection error:', localErr.message);
      }
    }
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

