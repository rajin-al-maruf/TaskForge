import Task from '../models/task.model.js'


const createTask = async (req, res) => {
    try {
        const {title, description, dueDate, priority, status} = req.body;

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            status,
            owner: req.user._id,
        })

        res.status(201).json({
            message: "A new task is created",
            task: {
                title: task.title, 
                description: task.description, 
                dueDate: task.dueDate, 
                priority: task.priority,
                status: task.status,
                owner: task.owner
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const getTask = async (req, res) => {
    try {
        const tasks = await Task.find({owner: req.user._id}).sort({createdAt: -1})
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const updateTask = async (req, res) => {
    try {
        if(Object.keys(req.body).length === 0){
            return res.status(400).json({
                message: "No data provided for update"
            })
        }

        const taskId = req.params.id
        const task = await Task.findById(taskId)
        if(!task) return res.status(400).json({message: "Task not found"})
        if(task.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Forbidden: You do not own this task"})
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {new: true, runValidators: true})
        res.status(200).json({ message: "Task updated successfully!" , updatedTask})
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id
        const task = await Task.findById(taskId)
        if(!task) return res.status(400).json({message: "Task not found"})
        if(task.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({message: "Forbidden: You do not own this task"})
        }

        const deleteTask = await Task.findByIdAndDelete(taskId)
        res.status(200).json({ message: "Task deleted" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export {createTask, getTask, updateTask, deleteTask}