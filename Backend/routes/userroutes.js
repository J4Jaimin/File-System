import express from 'express';
import isAuthorized from '../middlewares/auth.js';
import { getUserDetails, loginUser, logoutUser, registerUser } from '../controllers/usercontroller.js';


const router = express.Router();

router.get("/me", isAuthorized, getUserDetails);

router.post("/register", registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

export default router;