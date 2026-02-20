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

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw err;
});

// Export io for use in other modules if needed
export default io;
                          