import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minLength:1,
            maxLength: 30
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minLength:1,
            maxLength: 30
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
            maxLength: 100
        },
    },
    {
        timestamps: true
    }
)

//hash
userSchema.pre("save", async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

//compare
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema)
export default User;