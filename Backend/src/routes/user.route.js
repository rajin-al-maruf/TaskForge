import express from 'express';
import { 
    registerUser, 
    loginUser, 
    socialLoginUser, 
    updateProfile, 
    deleteAccount, 
    updatePassword 
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social-login', socialLoginUser);

router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);
router.put('/password', protect, updatePassword);

export default router;