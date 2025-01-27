import { readdir, rm, writeFile } from "fs/promises";
import express from 'express';
import dirData from '../utils/foldersdata.json' with {type: "json"};
import fileData from '../utils/filesdata.json' with {type: "json"};

const router = express.Router();

// read
router.get("/:id?", async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            const folderData = { ...dirData.dirs[0] };

            folderData.files = folderData.files.map((fileId) =>
                fileData.files.find((file) => file.id === fileId)
            );

            folderData.directories = folderData.directories.map((dirId) =>
                dirData.dirs.find((dir) => dir.id === dirId));

            res.json(folderData);
        }
        else {
            const resData = dirData.dirs.find((dir) => dir.id === id);

            resData.files = resData.files.map((fileId) =>
                fileData.files.find((file) => file.id === fileId)
            );

            resData.directories = resData.directories.map((dirId) =>
                dirData.dirs.find((dir) => dir.id === dirId));

            res.json(resData);
        }

    } catch (err) {
        next(err);
    }
});

// make new directory 
router.post("/:dirname", async (req, res, next) => {
    try {
        const dirname = req.params.dirname;
        const id = crypto.randomUUID();
        const parent = req.body.parent || dirData.dirs[0].id;

        dirData.dirs.find((dir) => dir.id === parent).directories.push(id);

        dirData.dirs.push({
            id,
            name: dirname,
            parent,
            files: [],
            directories: []
        });

        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(200).json({
            message: "Directory created successfully"
        });

    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
    }
});


export default router;
