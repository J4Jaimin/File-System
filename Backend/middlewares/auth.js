import { ObjectId } from 'mongodb';

const isAuthorized = async (req, res, next) => {
    const { uid } = req.cookies;
    const db = req.db;

    try {
        const user = await db.collection('user').findOne({ _id: new ObjectId(uid) });

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