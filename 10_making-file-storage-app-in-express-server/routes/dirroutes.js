import path from 'path';
import { readdir, rm } from "fs/promises";
import fs from 'fs/promises';
import express from 'express';

const router = express.Router();

// read
router.get("/?*", async (req, res, next) => {

    try {

        let { 0: dirPath } = req.params;
        dirPath = path.join('/', dirPath);

        const fullDirPath = path.join('./storage', dirPath);

        const fileList = await readdir(fullDirPath);
        const resData = [];

        for (const item of fileList) {
            const stats = await fs.stat(path.join(fullDirPath, item));
            resData.push({
                fileName: item,
                isDirectory: stats.isDirectory()
            });
        }

        res.json(resData);

    } catch (err) {
        next(err);
    }
});

// make new directory 
router.post("/?*", async (req, res, next) => {
    const dirPath = path.join('/', req.params[0]);
    console.log(dirPath);

    try {
        await fs.mkdir(path.join(path.resolve(import.meta.dirname, '..'), "storage", dirPath));
        res.json({
            message: "Directory created successfully."
        });
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log("Directory already exists");
            res.status(400).json({
                message: "Directory already exists"
            });
            return;
        }
        console.error(`Error creating directory: ${err.message}`);
    }
});


export default router;
