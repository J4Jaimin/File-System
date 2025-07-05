import User from '../models/usermodel.js';
import Session from '../models/sessionmodel.js';

export const getAllUsers = async (req, res) => {

    if(req.user.role === 'user') {
        return res.status(403).json({
            message: 'You are not authorized to access this resource'
        });
    }

    try {
        const users = await User.find({}, '-password -__v').lean();
        const usersWithLoginStatus = await Promise.all(users.map(async (user) => {
            const session = await Session.findOne({ userId: user._id });
            return {
                ...user,
                isLoggedIn: !!session
            };
        }));

        const dataToBeSend = {
            users: usersWithLoginStatus,
            role: req.user.role
        }

        res.status(200).json(dataToBeSend);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteParticularUser = async (req, res, next) => {

    const { userId } = req.body;

    if(req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'You are not authorized to delete a user'
        });
    }

    try {
        const user = await User.findByIdAndDelete(userId);
        await Session.deleteMany({ userId });
        req.dirId = user.rootdir;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();

        res.status(200).json({
             message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting user:', error);
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
            message: 'You are not authorized to logout a user'
        });
    }

    try {
        const session = await Session.findOneAndDelete({ userId });

        if (!session) {
            return res.status(404).json({ message: 'User not found or already logged out' });
        }

        res.status(200).json({ message: 'User logged out successfully' });

    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}