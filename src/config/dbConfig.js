import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        mongoose.connection.on('error', err => console.error('❌ MongoDB error:', err));
        mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
        mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🛑 MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

export const dbConfig = {
    MONGODB_URI
};
