import connectDB from './config/database.js'
import app from './app.js'
import dotenv from 'dotenv'

dotenv.config();

const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Server connection failed", error);
    }
}

startServer();