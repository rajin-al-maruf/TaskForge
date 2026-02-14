import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if(token==null){
            return res.status(401).json({ message: "Not authorized" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select("-password")

        if(!user){
            return res.status(401).json({message: "User not found"})
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({message: "Invalid token"})
    }
}

export default authMiddleware;