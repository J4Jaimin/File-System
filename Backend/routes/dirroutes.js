import { rm, writeFile } from "fs/promises";
import express from 'express';
import dirData from '../utils/foldersdata.json' with {type: "json"};
import fileData from '../utils/filesdata.json' with {type: "json"};
import path from "path";

const router = express.Router();

// read
router.get("/:id?", async (req, res, next) => {

    const id = req.params.id || dirData.dirs[0].id;
    const folderData = dirData.dirs.find((dir) => dir.id === id);

    if (!folderData) {
        return res.status(404).json({
            message: "Directory not found"
        });
    }

    const files = folderData.files.map((fileId) =>
        fileData.files.find((file) => file.id === fileId)
    );

    const directories = folderData.directories.map((dirId) =>
        dirData.dirs.find((dir) => dir.id === dirId)).map(({ id, name }) => ({ id, name }));

    res.status(200).json({ ...folderData, files, directories });

});

// make new directory 
router.post("/:parentId?", async (req, res, next) => {

    const dirname = req.headers.dirname || "New Folder";
    const id = crypto.randomUUID();
    const parent = req.params.parentId || dirData.dirs[0].id;

    const parentDir = dirData.dirs.find((dir) => dir.id === parent)

    if (!parentDir) {
        return res.status(404).json({
            message: "Parent directory does not exist."
        });
    }

    parentDir.directories.push(id);

    dirData.dirs.push({
        id,
        name: dirname,
        parent,
        files: [],
        directories: []
    });

    try {
        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(200).json({
            message: "Directory created successfully"
        });

    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        next(err);
    }
});

async function deleteFilesInDirectory(directoryData) {
    for (const fileId of directoryData.files) {
        const fileIndex = fileData.files.findIndex((file) => file.id === fileId);
        if (fileIndex !== -1) {
            const fileToBeDel = fileData.files[fileIndex];
            await rm(path.join(path.resolve(import.meta.dirname, '..'), "storage", `${fileId}${fileToBeDel.ext}`));
            fileData.files.splice(fileIndex, 1);
        }
    }
}

async function deleteNestedDirectories(directoryIds) {
    for (const dirId of directoryIds) {
        const dirIndex = dirData.dirs.findIndex((directory) => directory.id === dirId);
        if (dirIndex !== -1) {
            const directoryData = dirData.dirs[dirIndex];

            dirData.dirs.splice(dirIndex, 1);

            const parentDirData = dirData.dirs.find((dirData) => dirData.id === directoryData.parent);

            if (parentDirData) {
                parentDirData.directories = parentDirData.directories.filter((id) => id !== dirId);
            }

            await deleteFilesInDirectory(directoryData);

            await deleteNestedDirectories(directoryData.directories);

        }
    }
}

// delete directory 
router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const dirIndex = dirData.dirs.findIndex((directory) => directory.id === id);

        if (dirIndex === -1) {
            return res.status(404).json({
                message: "Directory not found."
            })
        }

        const directoryData = dirData.dirs[dirIndex];

        dirData.dirs.splice(dirIndex, 1);

        await deleteFilesInDirectory(directoryData);

        await deleteNestedDirectories(directoryData.directories);

        const parentDirData = dirData.dirs.find((dirData) => dirData.id === directoryData.parent);

        if (parentDirData) {
            parentDirData.directories = parentDirData.directories.filter((dirId) => dirId !== directoryData.id);
        }

        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));
        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(200).json({
            message: "Directory deleted successfully"
        });

    } catch (err) {
        console.log(err);
        next(err);
    }
});

// rename directory
router.patch("/:id", async (req, res, next) => {
    const dirName = req.body.newDirName;
    const id = req.params.id;
    const dirToRename = dirData.dirs.find((dir) => dir.id === id)

    if (!dirToRename) {
        return res.status(404).json({
            message: "Directory not found"
        });
    }

    dirToRename.name = dirName;

    try {
        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(200).json({
            message: "Directory renamed successfully!"
        })

    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;
