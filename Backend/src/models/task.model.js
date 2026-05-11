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
        completedAt: { type: Date },
        isArchived: { type: Boolean, default: false },
        archivedAt: { type: Date, default: null },
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

// Automatically permanently delete archived tasks after 30 days (2592000 seconds)
taskSchema.index({ archivedAt: 1 }, { expireAfterSeconds: 2592000 });

const Task = mongoose.model('Task', taskSchema)
export default Task;