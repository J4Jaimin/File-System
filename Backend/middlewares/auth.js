import crypto from 'crypto';
import UserModel from '../models/usermodel.js';

const isAuthorized = async (req, res, next) => {

    const { uid, hmac } = req.cookies;

    if (!uid || !hmac) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    try {
        const userId = uid.substring(0, 24);
        const expirationTime = uid.substring(24).toString(16);
        // const currentTime = Math.floor(Date.now() / 1000);

        const currentHash = crypto.createHash("sha256").update(userId + expirationTime).digest("base64url");

        if (currentHash != hmac) {
            console.log("userId updated by user");
            res.clearCookie('uid');
            res.clearCookie('email');
            res.clearCookie('hmac');
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        // console.log(Date(expirationTime))

        // if (currentTime > expirationTime) {
        //     res.clearCookie('uid');
        //     res.clearCookie('email');
        //     return res.status(401).json({
        //         error: "Unauthorized"
        //     });
        // }

        const user = await UserModel.findOne({ _id: userId });

        if (!uid || !user) {
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