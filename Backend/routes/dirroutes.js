import { rm } from "fs/promises";
import express from 'express';
import path from "path";
import { ObjectId } from 'mongodb';
import { validateObjectId } from "../middlewares/validation.js";

const router = express.Router();

// validation
router.param("id", validateObjectId);
router.param("parentId", validateObjectId);

// read
router.get("/:id?", async (req, res, next) => {

    const { uid, email } = req.cookies;
    const db = req.db;

    try {
        const dir = await db.collection('directories').findOne({ userId: new ObjectId(uid) });

        const id = req.params.id || dir._id.toString();

        const folderData = await db.collection("directories").findOne({ _id: new ObjectId(id) });

        if (!folderData) {
            return res.status(404).json({
                message: "Directory not found"
            });
        }

        const files = await Promise.all(
            folderData.files.map(async (fileId) => {
                const file = await db.collection("files").findOne({ _id: fileId });

                if (!file) return null;

                const newFile = { ...file, id: file._id };
                delete newFile._id;

                return newFile;
            }));

        const directories = await Promise.all(
            folderData.directories.map(async (dirId) => {
                const folder = await db.collection("directories").findOne({ _id: dirId });

                if (!folder) return null;

                return {
                    id: folder._id,
                    name: folder.name,
                }
            }));

        res.status(200).json({ ...folderData, files, directories });

    } catch (error) {
        console.log(error);
        next(error);
    }
});

// make new directory 
router.post("/:parentId?", async (req, res, next) => {

    const { uid, email } = req.cookies;
    const dirname = req.headers.dirname || "New Folder";
    const db = req.db;

    try {
        const dir = await db.collection("directories").findOne({ userId: new ObjectId(uid) });

        const parent = req.params.parentId || dir._id.toString();

        const parentDir = await db.collection("directories").findOne({ _id: new ObjectId(parent) });

        if (!parentDir) {
            return res.status(404).json({
                message: "Parent directory does not exist."
            });
        }

        const insertedDir = await db.collection("directories").insertOne({
            name: dirname,
            parent: new ObjectId(parent),
            userId: new ObjectId(uid),
            files: [],
            directories: []
        });

        await db.collection('directories').updateOne(
            { _id: parentDir._id },
            { $push: { directories: insertedDir.insertedId } }
        );

        res.status(200).json({
            message: "Directory created successfully"
        });

    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
        next(err);
    }
});

async function deleteFilesInDirectory(directoryData, db) {
    for (const fileId of directoryData.files) {
        const fileData = await db.collection("files").findOne({ _id: new ObjectId(fileId) });
        if (fileData) {
            await rm(path.join(path.resolve(import.meta.dirname, '..'), "storage", `${new ObjectId(fileId)}${fileData.ext}`));
        }
    }
    await db.collection("files").deleteMany({ _id: { $in: directoryData.files } });
}

// delete recursively nested directories.
async function deleteNestedDirectories(directoryIds, db) {

    for (const dirId of directoryIds) {

        const dir = await db.collection("directories").findOne({ _id: new ObjectId(dirId) });

        if (dir) {
            await deleteFilesInDirectory(dir, db);
            await deleteNestedDirectories(dir.directories, db);
            await db.collection("directories").findOneAndUpdate(
                { _id: dir.parent },
                {
                    $pull: { directories: dirId }
                });
        }
    }

    await db.collection("directories").deleteMany({ _id: { $in: directoryIds } });
}

// delete directory 
router.delete("/:id", async (req, res, next) => {

    try {
        const { uid } = req.cookies;
        const id = req.params.id;
        const db = req.db;
        const dirData = await db.collection("directories").findOne({ _id: new ObjectId(id) });

        if (!dirData) {
            return res.status(404).json({
                message: "Directory not found."
            })
        }

        await deleteFilesInDirectory(dirData, db);

        await db.collection("directories").findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { files: [] } }
        );

        await deleteNestedDirectories(dirData.directories, db);

        await db.collection("directories").findOneAndUpdate(
            { _id: dirData.parent },
            { $pull: { directories: dirData._id } }
        );

        await db.collection("directories").deleteOne({ _id: new ObjectId(id) });

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

    const { uid } = req.cookies;
    const dirName = req.body.newDirName;
    const db = req.db;
    const id = req.params.id;

    try {
        const dirToRename = await db.collection("directories").findOne({ _id: new ObjectId(id) });

        if (!dirToRename) {
            return res.status(404).json({
                message: "Directory not found"
            });
        }

        await db.collection("directories").findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { name: dirName } }
        );

        res.status(200).json({
            message: "Directory renamed successfully!"
        })

    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;
