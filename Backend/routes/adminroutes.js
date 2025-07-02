import express from 'express';
import { getAllUsers, logoutParticularUser } from '../controllers/admincontroller.js';
import isAuthorized from '../middlewares/auth.js';

const router = express.Router();

router.get('/users', isAuthorized, (req, res, next) => {    

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role !== 'user') {
        return next();
    }
    return res.status(403).json({
        message: "You are not authorized to access this resource."
    });

}, getAllUsers);

router.post('/logout-user', isAuthorized, (req, res, next) => {

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        message: "You are not authorized to logout a user."
    });

}, logoutParticularUser);


export default router;