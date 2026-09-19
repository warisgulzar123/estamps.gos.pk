const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const { MongoServerError } = require('mongodb');

// ANSI colour codes for terminal output
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const RESET  = '\x1b[0m';

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error(`${RED}✘ MONGO_URI is not defined in environment variables.${RESET}`);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        return null;
    }

    // Reuse existing active connection across serverless invocations
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!cachedPromise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 8000,
        };

        cachedPromise = mongoose.connect(uri, opts).then((conn) => {
            console.log(
                `${GREEN}✔ Real MongoDB Atlas Connected Successfully! Host: ${conn.connection.host}${RESET}`
            );
            cachedConnection = conn;
            return conn;
        }).catch((error) => {
            cachedPromise = null;
            if (error instanceof MongoServerError && error.code === 8000) {
                console.error(
                    `${RED}✘ Authentication Failed: Bad Authentication. Please check your MongoDB Atlas credentials in MONGO_URI${RESET}`
                );
            } else {
                console.error(
                    `${RED}✘ Real MongoDB Connection Failed: ${error.message}${RESET}`
                );
            }
            if (process.env.NODE_ENV !== 'production') {
                process.exit(1);
            }
            throw error;
        });
    }

    try {
        await cachedPromise;
    } catch (err) {
        cachedPromise = null;
        throw err;
    }

    return mongoose.connection;
};

module.exports = connectDB;
