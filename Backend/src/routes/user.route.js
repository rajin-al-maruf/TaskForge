import { Router } from 'express'
import { loginUser, registerUser } from "../controllers/user.controller.js"
import authMiddleware from '../middleware/auth.middleware.js'

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  })
})

export default router