import { Router } from 'express'
import { loginUser, registerUser, updateProfile, deleteAccount, updatePassword } from "../controllers/user.controller.js"

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)

router.route('/profile').put(updateProfile)
router.route('/profile').delete(deleteAccount)
router.route('/password').put(updatePassword)

export default router