import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, default: 'bg-blue-400' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const List = mongoose.model('List', listSchema);