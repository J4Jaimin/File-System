import express from 'express';
import userData from '../utils/userdata.json' with {type: "json"};
import dirData from '../utils/foldersdata.json' with {type: "json"};
import { writeFile } from 'fs/promises';


const router = express.Router();

router.get("/:id?", (req, res, next) => {
    /* logic */

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
        });
    });

    res.status(200).json({
        message: "User logged in successfully"
    });
});


export default router;