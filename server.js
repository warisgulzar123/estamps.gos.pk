// ── Load environment variables FIRST before any other require reads process.env ──
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const connectDB     = require('./config/db');
const estampRoutes  = require('./routes/estampRoutes');

// Connect to MongoDB Atlas (exits process on failure)
connectDB();

const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/estamp', estampRoutes);
app.use('/api/stamps', estampRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'EStamp Server is running', db: 'MongoDB Atlas' });
});

// ── Start Server locally; Vercel invokes the exported app ──
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\x1b[36mServer listening on port ${PORT}\x1b[0m`);
    });
}

module.exports = app;
