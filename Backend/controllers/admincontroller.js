import User from '../models/usermodel.js';
import Session from '../models/sessionmodel.js';

export const getAllUsers = async (req, res, next) => {
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

export const logoutParticularUser = async (req, res, next) => {

    const { userId } = req.body;

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