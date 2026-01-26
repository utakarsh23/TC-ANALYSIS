const express = require('express');
const cors = require('cors');
const SubmitRouter = require('./Routes/SubmitRouter');
const { jsonParser } = require('./Middlewares/index');
require('dotenv').config();

// Handle EPIPE errors gracefully - happens on Render when logs close
if (process.stdout && process.stdout.on) {
    process.stdout.on('error', (err) => {
        if (err.code !== 'EPIPE') throw err;
        // Silently ignore EPIPE
    });
}

if (process.stderr && process.stderr.on) {
    process.stderr.on('error', (err) => {
        if (err.code !== 'EPIPE') throw err;
        // Silently ignore EPIPE
    });
}

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (err) => {
    if (err.code === 'EPIPE' || err.errno === -32) {
        // Silently ignore EPIPE
        return;
    }
    console.error('Uncaught Exception:', err);
});

const app = express();
const PORT = process.env.PORT || 9092;

app.use(jsonParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'https://tc-analysis-xi.vercel.app'],
    credentials: true
}));

try {
    console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'using defaults');
} catch (e) {
    // Ignore console errors
}

// Routes
app.use("/api", SubmitRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
    try {
        console.log("Server has been started on Port :" + PORT);
    } catch (e) {
        // Ignore console errors
    }
});
