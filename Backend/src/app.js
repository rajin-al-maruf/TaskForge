import express from "express"
import cors from "cors"

const app = express();

app.use(express.json()) //backend can read the body of incoming requests
app.use(cors()) //to allow future React app to connect.

import userRouter from "./routes/user.route.js"
import taskRouter from "./routes/task.route.js"

app.use('/api/users', userRouter)
app.use('/api/tasks', taskRouter)

//ex route: http://localhost:5000/api/users/register

export default app;