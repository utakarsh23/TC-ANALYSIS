const express = require('express');
const cors = require('cors');
const SubmitRouter = require('./Routes/SubmitRouter');
const { jsonParser } = require('./Middlewares/index');
require('dotenv').config();

// Handle EPIPE error on Render - prevents crash on stdout close
process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') {
        // Ignore EPIPE errors - happens when logs are closed
        return;
    }
    throw err;
});

process.stderr.on('error', (err) => {
    if (err.code === 'EPIPE') {
        return;
    }
    throw err;
});

const app = express();
const PORT = process.env.PORT || 9092;

app.use(jsonParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'https://tc-analysis-xi.vercel.app'],
    credentials: true
}));
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'using defaults');

// Routes
app.use("/api", SubmitRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log("Server has been started on Port :" + PORT));
