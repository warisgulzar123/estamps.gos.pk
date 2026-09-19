// ── Load environment variables FIRST before any other require reads process.env ──
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const connectDB     = require('./config/db');
const estampRoutes  = require('./routes/estampRoutes');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ── CORS Configuration ──
// Accepts requests from any frontend domain, or comma-separated domains in FRONTEND_URL
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : null;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // If FRONTEND_URL is specified, check against it or allow '*'
        if (allowedOrigins) {
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
        }

        // Permissive fallback: allow any frontend domain seamlessly
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (err) {
        console.error('MongoDB connection check failed:', err.message);
    }
    next();
});

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/estamp', estampRoutes);
app.use('/api/stamps', estampRoutes);

// Health check
app.get('/api', (req, res) => {
    res.json({ message: 'EStamp Server API is running on Vercel', status: 'online' });
});

app.get('/', (req, res) => {
    res.json({ message: 'EStamp Server is running', db: 'MongoDB Atlas', status: 'online' });
});

// ── Start Server locally (Conditional for Vercel Serverless) ──
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0';
    app.listen(PORT, HOST, () => {
        console.log(`\x1b[36m✔ Server listening on http://${HOST}:${PORT}\x1b[0m`);
    });
}

module.exports = app;
