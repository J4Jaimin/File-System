import express from 'express';
import userData from '../utils/userdata.json' with {type: "json"};
import dirData from '../utils/foldersdata.json' with {type: "json"};
import { writeFile } from 'fs/promises';
import isAuthorized from '../middlewares/auth.js';


const router = express.Router();

router.get("/me", isAuthorized, (req, res, next) => {
    res.status(200).json({
        name: req.user.name,
        email: req.user.email
    });
});

router.post("/register", async (req, res, next) => {
    const { name, email, password } = req.body;
    const userId = crypto.randomUUID();
    const rootDirId = crypto.randomUUID();

    const cookies = {
        uid: userId,
        email,
    }

    Object.entries(cookies).forEach(([key, value]) => {
        res.cookie(key, value, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7 * 1000,
        });
    });

    userData.users.push({
        id: userId,
        name,
        email,
        password,
        rootdir: rootDirId,
    });

    dirData.dirs.push({
        id: rootDirId,
        name: `root-${email}`,
        userId,
        parent: null,
        files: [],
        directories: []
    });

    try {
        await writeFile("./utils/userdata.json", JSON.stringify(userData));
        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        next(error);
    }
})

router.post('/login', (req, res, next) => {

    const { email, password } = req.body;

    const user = userData.users.find((user) => user.email === email);

    req.user = user;

    if (!user || user.password !== password) {
        return res.status(404).json({
            error: "Invalid credentials"
        });
    }

    const cookies = {
        uid: user.id,
        email: user.email,
    }

    Object.entries(cookies).forEach(([key, value]) => {
        res.cookie(key, value, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7 * 1000,
            sameSite: "none",
            secure: true
        });
    });

    res.status(200).json({
        message: "User logged in successfully"
    });
});

router.post('/logout', (req, res, next) => {
    res.clearCookie('uid');
    res.clearCookie('email');
    res.status(200).json({
        message: "User logged out successfully"
    });
});

export default router;