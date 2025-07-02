import express from 'express';
import { getAllUsers } from '../controllers/admincontroller.js';
// import isAuthorized from '../middlewares/auth.js';

const router = express.Router();

router.get('/users', getAllUsers);


export default router;