import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 300,
        },
        description: {
            type: String,
            trim: true,
        },
        list: {
        type: String,
        default: 'Personal'
        },
        timeEstimate: {
            type: Number,
            default: 25
        },
        subtasks: [{
            title: String,
            completed: { type: Boolean, default: false }
        }],
        dueDate: Date,
        priority: {
            type: String,
            enum: ['none', 'low', 'medium', 'high'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['in-progress', 'completed']
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

const Task = mongoose.model('Task', taskSchema)
export default Task;