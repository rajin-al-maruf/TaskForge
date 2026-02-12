import express from "express"
import cors from "cors"

const app = express();

app.use(express.json()) //backend can read the body of incoming requests
app.use(cors()) //to allow future React app to connect.

export default app;