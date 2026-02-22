import mongoose from 'mongoose';
import logger from '../util/logger.js';

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        logger.info('Database connected successfully');
    } catch (err) {
        logger.error('Database connection error:', err);
        process.exit(1);
    }
}

export default dbConnection;