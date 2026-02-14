import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if(!username || !email || !password){
            return res.status(400).json({ message: "All fields are required." })
        }

        const userExist = await User.findOne({email})
        if (userExist) {
            return res.status(400).json({ message: "User already exist." })
        }

        const user = await User.create({
            username,
            email,
            password,
        })
        res.status(201).json({
            message: "User registered successfully!!",
            user: {id: user._id, username: user.username, email: user.email}
        })
    } catch (error) {
        res.status(500).json({ message: "internal server error", error: error.message })
    }


}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ message: "User not registered" })
        }

        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({user: user._id}, process.env.JWT_SECRET)

        res.status(200).json({
            message: "User login successfull!!",
            token,
            user: {id: user._id, username: user.username, email: user.email}
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error"})
    }
}

export {registerUser, loginUser}