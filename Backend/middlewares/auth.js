import UserModel from '../models/usermodel.js';

const isAuthorized = async (req, res, next) => {
    const { uid } = req.cookies;

    try {
        const user = await UserModel.findOne({ _id: uid });

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