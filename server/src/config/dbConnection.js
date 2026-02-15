import mongoose from 'mongoose';

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

export default dbConnection;