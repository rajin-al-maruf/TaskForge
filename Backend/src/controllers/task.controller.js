import Task from '../models/task.model.js'


const createTask = async (req, res) => {
    try {
        const {title, description, dueDate, priority, status, list, timeEstimate, subtasks} = req.body;

        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority: priority || "none",
            status: status || "in-progress",
            list: list || "Personal",
            timeEstimate: timeEstimate || 25,
            subtasks: subtasks || [],
            owner: req.user._id,
        })

        res.status(201).json({
            success: true,
            message: "A new task is created",
            task
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const getTask = async (req, res) => {
    try {
        const queryObj = {owner: req.user._id, ...req.query}
        const tasks = await Task.find(queryObj).sort({createdAt: -1})
        res.status(200).json({success: true, totalTask: tasks.length, tasks})
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const updateTask = async (req, res) => {
    try {
        if(Object.keys(req.body).length === 0){
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            })
        }

        const taskId = req.params.id
        const task = await Task.findById(taskId)
        if(!task) return res.status(404).json({success: false, message: "Task not found"})
        if(task.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({success: false, message: "Forbidden: You do not own this task"})
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {new: true, runValidators: true})
        res.status(200).json({ success: true, message: "Task updated successfully!" , updatedTask})
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id
        const task = await Task.findById(taskId)
        if(!task) return res.status(404).json({success: false, message: "Task not found"})
        if(task.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({success: false, message: "Forbidden: You do not own this task"})
        }

        const deleteTask = await Task.findByIdAndDelete(taskId)
        res.status(200).json({ success: true, message: "Task deleted", deleteTask })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

export {createTask, getTask, updateTask, deleteTask}