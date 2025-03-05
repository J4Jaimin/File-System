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
    const db = req.db;

    try {

        const foundUser = await db.collection("user").findOne({ email });

        if (foundUser) {
            return res.status(409).json({
                error: "User already exists",
                message: "A user with this email is already exist, please try different email.",
            });
        }

        const dir = {
            name: `root-${email}`,
            parent: null,
            files: [],
            directories: [],
        }

        const insertedDir = await db.collection("directories").insertOne(dir);

        const user = {
            name,
            email,
            password,
            rootdir: insertedDir.insertedId,
        }

        const insertedUser = await db.collection("user").insertOne(user);

        await db.collection("directories").updateOne({
            _id: insertedDir.insertedId
        }, {
            $set: {
                userId: insertedUser.insertedId
            }
        });

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        next(error);
    }
})

router.post('/login', async (req, res, next) => {

    try {
        const { email, password } = req.body;
        const db = req.db;
        const user = await db.collection("user").findOne({ email, password });

        if (!user) {
            return res.status(404).json({
                error: "Invalid credentials"
            });
        }

        const cookies = {
            uid: user._id.toString(),
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

    } catch (error) {
        console.log(error);
        next();
    }
});

router.post('/logout', (req, res, next) => {
    res.clearCookie('uid');
    res.clearCookie('email');
    res.status(200).json({
        message: "User logged out successfully"
    });
});

export default router;