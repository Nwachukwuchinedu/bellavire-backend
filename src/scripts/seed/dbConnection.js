import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

// Connect to MongoDB
export const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const options = {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 30000,
            connectTimeoutMS: 30000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        isConnected = true;
        console.log('MongoDB connected for seeding...');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Disconnect from MongoDB
export const disconnectDB = async () => {
    if (isConnected) {
        await mongoose.disconnect();
        isConnected = false;
        console.log('MongoDB disconnected');
    }
};
