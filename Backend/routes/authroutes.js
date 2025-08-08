import express from 'express';
import { sendOtpToEmail, verifyOtp, googleAuth, resetPassword, forgotPassword } from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/send-otp', sendOtpToEmail);

router.post('/verify-otp', verifyOtp);

router.post('/google-auth', googleAuth);

router.post('/reset-password', resetPassword);

router.post('/forgot-password', forgotPassword);


export default router;

