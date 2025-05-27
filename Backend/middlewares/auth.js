import Session from '../models/sessionmodel.js';
import UserModel from '../models/usermodel.js';

const isAuthorized = async (req, res, next) => {

    const session_id = req.signedCookies.sid;

    if (!session_id) {
        res.clearCookie('sid');
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {

        const session = await Session.findById(session_id);

        if (!session) {
            res.clearCookie('sid');
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const user = await UserModel.findOne({ _id: session.userId });

        if (!user) {
            res.clearCookie('sid');
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