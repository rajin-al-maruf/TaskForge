import { List } from '../models/list.model.js';

export const getLists = async (req, res) => {
    try {
        const lists = await List.find({ owner: req.user._id });
        res.status(200).json({ success: true, lists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createList = async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "List name is required" });

        const newList = await List.create({
            name,
            color: color || 'bg-blue-400',
            owner: req.user._id
        });

        res.status(201).json({ success: true, list: newList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteList = async (req, res) => {
    try {
        const list = await List.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!list) return res.status(404).json({ success: false, message: "List not found" });
        res.status(200).json({ success: true, message: "List deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};