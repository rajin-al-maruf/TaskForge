import express from "express"
import cors from "cors"
import mongoose from "mongoose"

const app = express();

app.use(express.json()) //backend can read the body of incoming requests
app.use(cors()) //to allow future React app to connect.

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

// Connect to MongoDB for Vercel Serverless Environment
const connectDB = async () => {
    // Prevent reconnecting if already connected
    if (mongoose.connections[0].readyState) return;
    
    // Make sure the variable matches what you named it in your .env file!
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
}
connectDB();

export default app;