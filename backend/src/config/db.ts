import mongoose from 'mongoose';
import { env } from './env';

export const connectDb = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    await Promise.all(mongoose.modelNames().map(name => mongoose.model(name).init()));
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination (SIGTERM)');
  process.exit(0);
});
