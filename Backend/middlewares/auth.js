import crypto from 'crypto';
import UserModel from '../models/usermodel.js';

const isAuthorized = async (req, res, next) => {

    const token = req.signedCookies.token;

    if (!token) {
        res.clearCookie('token');
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    const { uid } = JSON.parse(token);

    try {
        const user = await UserModel.findOne({ _id: uid });
        if (!user) {
            res.clearCookie('token');
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(error);
    }
}

export default isAuthorized;