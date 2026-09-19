const mongoose = require('mongoose');
const { MongoServerError } = require('mongodb');

// ANSI colour codes for terminal output
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const RESET  = '\x1b[0m';

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error(`${RED}✘ MONGO_URI is not defined in environment variables — cannot start server.${RESET}`);
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,   // fail fast if Atlas is unreachable
        });

        console.log(
            `${GREEN}✔ Real MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}${RESET}`
        );
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 8000) {
            console.error(
                `${RED}✘ Authentication Failed: Bad Authentication. Please check your MongoDB Atlas credentials in MONGO_URI${RESET}`
            );
        } else {
            console.error(
                `${RED}✘ Real MongoDB Connection Failed: ${error.message}${RESET}`
            );
        }
        process.exit(1);
    }
};

module.exports = connectDB;
