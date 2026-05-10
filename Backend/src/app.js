import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' })) // Increased limit for base64 image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cors()) //to allow future React app to connect.

// Connect to MongoDB lazily for Vercel Serverless Environment
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState >= 1) {
        return next();
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL || process.env.MONGO_URI);
        next();
    } catch (error) {
        console.error("Serverless DB Connection Error:", error);
        res.status(500).json({ success: false, message: "Database connection error" });
    }
});

import userRouter from "./routes/user.route.js"
import taskRouter from "./routes/task.route.js"
import listRouter from "./routes/list.route.js"

app.use('/api/users', userRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/lists', listRouter)

//ex route: http://localhost:5000/api/users/register

// Default health check route for browser testing
app.get('/', (req, res) => {
    res.status(200).send('TaskForge API is up and running! 🚀');
});

export default app;