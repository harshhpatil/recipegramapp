import dotenv from 'dotenv';
dotenv.config();

import dbConnection from "./config/dbConnection.js";
dbConnection();

import app from "./app.js";
import { createServer } from 'http';
import { initializeSocket } from './util/socket.js';

// Create HTTP server for socket.io
const httpServer = createServer(app);

// Initialize socket.io
const io = initializeSocket(httpServer);

httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

// Export io for use in other modules if needed
export default io;
                          