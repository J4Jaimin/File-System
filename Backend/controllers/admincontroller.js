import User from '../models/usermodel.js';
import { getAllUserSessions, deleteAllUserSessions } from '../utils/sessionmanager.js';

export const getAllUsers = async (req, res) => {

    if(req.user.role === 'user') {
        return res.status(403).json({
            message: 'You are not authorized to access this resource'
        });
    }

    try {
        const users = await User.find({isDeleted: false}, '-password -__v').lean();
        const deletedUsers = await User.find({isDeleted: true}, '-password -__v').lean();
        const usersWithLoginStatus = await Promise.all(users.map(async (user) => {
            const sessions = await getAllUserSessions(user._id.toString());
            return {
                ...user,
                isLoggedIn: sessions.documents.length > 0
            };
        }));

        const dataToBeSend = {
            users: usersWithLoginStatus,
            deletedUsers: deletedUsers,
            role: req.user.role,
            name: req.user.name
        }

        res.status(200).json(dataToBeSend);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteParticularUser = async (req, res, next) => {

    const { userId, type } = req.body;

    try {
        if(type == 'soft') {
            await User.findByIdAndUpdate(userId, { isDeleted: true });
        }
        else {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            req.dirId = user.rootdir;
            next();
        }

        await deleteAllUserSessions(userId);

        res.status(200).json({
             message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const changeRole = async (req, res) => {

    const userId = req.params.userId;
    const { role } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ 
            message: 'User role updated successfully' 
        });

    } catch (error) {
        console.error('Error changing user role:', error);
        next();
    }
}

export const restoreUser = async (req, res) => {

    const userId = req.body.userId; 

    try {
        const user = await User.findById(userId);   

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isDeleted) {
            return res.status(400).json({ message: 'User is not deleted' });
        }

        user.isDeleted = false;
        await user.save();

        res.status(200).json({ message: 'User restored successfully' });

    } catch (error) {
        console.error('Error restoring user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logoutParticularUser = async (req, res) => {

    const { userId } = req.body;
    const user = await User.findById(userId);

    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if((req.user.role === 'admin' && user.role === 'admin') || 
        (req.user.role === 'manager' && user.role !== 'user') || 
         (req.user.role === 'user')) {
        return res.status(403).json({
            message: 'You are not authorized to logout a user.'
        });
    }

    try {
        await deleteAllUserSessions(userId);

        res.status(200).json({ message: 'User logged out successfully' });

    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}