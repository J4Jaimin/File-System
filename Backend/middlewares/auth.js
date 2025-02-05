import userData from '../utils/userdata.json' with {type: "json"};

const isAuthorized = (req, res, next) => {
    const { uid } = req.cookies;

    const user = userData.users.find((user) => user.id === uid);

    if (!uid || !user) {
        return res.status(401).json({
            error: "Unauthorized"
        });
    }

    req.user = user;

    next();
}

export default isAuthorized;