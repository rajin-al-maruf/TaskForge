import express from 'express';
import { getLists, createList, deleteList } from '../controllers/list.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware); // Ensure all list routes require a logged-in user

router.route('/').get(getLists).post(createList);
router.route('/:id').delete(deleteList);

export default router;