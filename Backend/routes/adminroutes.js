import express from 'express';
import { getAllUsers, logoutParticularUser, deleteParticularUser, changeRole, restoreUser } from '../controllers/admincontroller.js';
import isAuthorized from '../middlewares/auth.js';
import { deleteDirectory } from '../controllers/dircontroller.js';

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

router.delete('/delete-user', isAuthorized, (req, res, next) => {

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        message: "You are not authorized to delete a user."
    });

}, deleteParticularUser, deleteDirectory);

router.post('/logout-user', isAuthorized, (req, res, next) => {

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role !== 'user') {
        return next();
    }

    return res.status(403).json({
        message: "You are not authorized to logout a user."
    });

}, logoutParticularUser);

router.post('/restore-user', isAuthorized, (req, res, next) => {

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role !== 'admin') {
        return res.status(403).json({
            message: "You are not authorized to restore a user."
        });
    }

    next();

}, restoreUser);

router.put('/role-change/:userId', isAuthorized, (req, res, next) => {

    if(!req.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    if(req.user.role !== 'admin') {
        return res.status(403).json({
            message: "You are not authorized to change a user's role."
        });
    }

    next();

}, changeRole);


export default router;