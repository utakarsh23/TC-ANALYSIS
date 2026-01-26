const express = require('express');
const cors = require('cors');
const SubmitRouter = require('./Routes/SubmitRouter');
const { jsonParser } = require('./Middlewares/index');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 9092;



app.use(jsonParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
console.log(process.env.CORS_ORIGIN);

// Routes
app.use("/api", SubmitRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log("Server has been started on Port :" + PORT));
