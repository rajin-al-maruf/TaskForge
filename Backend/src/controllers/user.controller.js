import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({ success: false, message: "All fields are required." })
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format." })
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
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, userType: user.userType, profilePicture: user.profilePicture, preferences: user.preferences}
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
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, userType: user.userType, profilePicture: user.profilePicture, preferences: user.preferences}
        })
    } catch (error) {
        console.error("loginUser error", error);
        res.status(500).json({ success: false, message: "Internal server error"})
    }
}

const socialLoginUser = async (req, res) => {
    try {
        const { email, firstName, lastName, profilePicture } = req.body;

        // Log incoming social-login attempts for debugging (do NOT log sensitive data)
        console.info(`[social-login] request - email=${email || 'N/A'} origin=${req.headers.origin || 'N/A'} ua=${req.headers['user-agent'] || 'N/A'} ip=${req.ip || req.connection?.remoteAddress || 'N/A'}`);

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required from social provider" });
        }

        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user with a strong random password since they use social login
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + "A1!";
            user = await User.create({
                firstName: firstName || "User",
                lastName: lastName || "",
                email,
                password: generatedPassword,
                profilePicture: profilePicture || ""
            });

            console.info(`[social-login] created new user - id=${user._id} email=${user.email}`);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            message: "Social login successful!!",
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, userType: user.userType, profilePicture: user.profilePicture, preferences: user.preferences }
        });
    } catch (error) {
        console.error("socialLoginUser error", { message: error.message, stack: error.stack, body: { ...(req.body || {}) } });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        // Extract user ID from token
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { firstName, lastName, email, profilePicture, preferences, userType } = req.body;
        
        // Validate email if it's being updated
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "Invalid email format" });
            }
            // Check if email is already in use by another user
            const existingUser = await User.findOne({ email, _id: { $ne: decoded.id } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already in use by another account" });
            }
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (preferences) updateData.preferences = preferences;
        if (userType === 'pro' || userType === 'free') updateData.userType = userType;

        // Find user and update their details
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password'); 
        
        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
        
        res.status(200).json({ success: true, message: "Profile updated", user: updatedUser });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const deletedUser = await User.findByIdAndDelete(decoded.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
        
        res.status(200).json({ success: true, message: "Account successfully deleted" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updatePassword = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

        user.password = newPassword;
        await user.save(); // This automatically hashes the new password due to your pre-save hook

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export {registerUser, loginUser, socialLoginUser, updateProfile, deleteAccount, updatePassword}