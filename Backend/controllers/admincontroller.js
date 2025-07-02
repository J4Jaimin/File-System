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

        res.status(200).json(usersWithLoginStatus);

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}