import { createTask, deleteTask, getTask, updateTask } from '../controllers/task.controller.js';
import authMiddleware from '../middleware/auth.middleware.js'
import { Router } from 'express'

const router = Router();

router.use(authMiddleware)

router.route('/today').post(createTask)
router.route('/today').get(getTask)
router.route('/today/:id').put(updateTask)
router.route('/today/:id').delete(deleteTask)


export default router;