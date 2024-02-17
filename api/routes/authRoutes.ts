import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

//router.get('/profile', getUserProfile);

export default router;