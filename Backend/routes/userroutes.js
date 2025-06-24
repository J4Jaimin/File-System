import express from 'express';
import isAuthorized from '../middlewares/auth.js';
import { getUserDetails, loginUser, logoutUser, registerUser, logoutAllUser, sendOtpToEmail, verifyOtp, googleAuth } from '../controllers/usercontroller.js';


const router = express.Router();

router.get("/me", isAuthorized, getUserDetails);

router.post("/register", registerUser);

router.post('/login', loginUser);

router.post('/send-otp', sendOtpToEmail);

router.post('/verify-otp', verifyOtp);

router.post('/google/auth', googleAuth);

router.post('/logout', logoutUser);

router.post('/logoutall', logoutAllUser);

export default router;