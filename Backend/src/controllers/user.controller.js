import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({ success: false, message: "All fields are required." })
        }

        const userExist = await User.findOne({email})
        if (userExist) {
            return res.status(400).json({ success: false, message: "User already exist." })
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
        })

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.status(201).json({
            success: true,
            token,
            message: "User registered successfully!!",
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email}
        })
    } catch (error) {
        console.error("registerUser error", error);
        res.status(500).json({ success: false, message: "internal server error", error: error.message })
    }


}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ success: false, message: "User not registered" })
        }

        const isMatch = await user.comparePassword(password)
        if(!isMatch){
            return res.status(400).json({ success: false, message: "Invalid credentials" })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.status(200).json({
            success: true,
            message: "User login successfull!!",
            token,
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email}
        })
    } catch (error) {
        console.error("loginUser error", error);
        res.status(500).json({ success: false, message: "Internal server error"})
    }
}

export {registerUser, loginUser}