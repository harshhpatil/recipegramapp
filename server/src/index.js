import dotenv from 'dotenv';
dotenv.config();

import dbConnection from "./config/dbConnection.js";
dbConnection();

import app from "./app.js";

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});                          