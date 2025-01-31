import express from 'express';
import userData from '../utils/userdata.json' with {type: "json"};
import dirData from '../utils/foldersdata.json' with {type: "json"};
import { writeFile } from 'fs/promises';


const router = express.Router();

router.get("/:id?", (req, res, next) => {
    /* logic */

});

router.post("/register", async (req, res, next) => {
    const { name, email, pwd } = req.body;
    const userId = crypto.randomUUID();
    const rootDirId = crypto.randomUUID();

    userData.users.push({
        id: userId,
        name,
        email,
        password: pwd,
        rootdir: rootDirId,
    });

    dirData.dirs.push({
        id: rootDirId,
        name: `root-${email}`,
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


export default router;