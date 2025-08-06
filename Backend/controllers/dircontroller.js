import mongoose from "mongoose";
import { rm } from 'fs/promises';
import path from "path";
import DirModel from "../models/dirmodel.js";
import FileModel from "../models/filemodel.js";
import { getSession } from "../utils/sessionmanager.js";
export const getDirectories = async (req, res, next) => {

    let sid = req.signedCookies.sid;
    const s = await getSession(sid);
    const uid = s.userId;

    try {
        const dir = await DirModel.findOne({ userId: uid });
        const id = req.params.id || dir._id.toString();
        const folderData = await DirModel.findOne({ _id: id });

        if (!folderData) {
            return res.status(404).json({
                message: "Directory not found"
            });
        }

        const files = await FileModel.find({dirId: id}).lean();

        const directories = await DirModel.find({parent: id}).lean();

        // const files = await Promise.all(
        //     folderData.files.map(async (fileId) => {
        //         const file = await FileModel.findOne({ _id: fileId });

        //         if (!file) return null;

        //         const newFile = { ...file._doc, id: file._id };
        //         delete newFile._id;

        //         return newFile;
        //     }));

        // const directories = await Promise.all(
        //     folderData.directories.map(async (dirId) => {
        //         const folder = await DirModel.findOne({ _id: dirId });

        //         if (!folder) return null;

        //         return {
        //             id: folder._id,
        //             name: folder.name,
        //         }
        //     }));

        res.status(200).json({ ...folderData, files, directories });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const makeDirectory = async (req, res, next) => {

    let sid = req.signedCookies.sid;
    const s = await getSession(sid);
    const uid = s.userId;
    const dirname = req.headers.dirname || "New Folder";
    const session = await mongoose.startSession();

    try {
        const dir = await DirModel.findOne({ userId: uid });
        const parent = req.params.parentId || dir._id.toString();
        const parentDir = await DirModel.findOne({ _id: parent });

        if (!parentDir) {
            return res.status(404).json({
                message: "Parent directory does not exist."
            });
        }

        session.startTransaction();

        await DirModel.create([{
            name: dirname,
            parent: parent,
            userId: uid,
        }], { session });

        // await DirModel.updateOne(
        //     { _id: parentDir._id },
        //     { $push: { directories: insertedDir[0]._id } },
        //     { session }
        // );

        await session.commitTransaction();

        session.endSession();

        res.status(200).json({
            message: "Directory created successfully"
        });

    } catch (err) {
        session.abortTransaction();
        console.error(`Error creating directory: ${err.message}`);
        next(err);
    } finally {
        session.endSession();
    }
};

async function deleteFilesInDirectory(fileIds) {
    for (const fileId of fileIds) {
        const fileData = await FileModel.findOne({ _id: fileId });
        if (fileData) {
            await rm(path.join(path.resolve(import.meta.dirname, '..'), "storage", `${String(fileId)}${fileData.ext}`));
        }

    }
    await FileModel.deleteMany({ _id: { $in: fileIds } });
}

async function deleteNestedDirectories(directoryIds) {

    for (const dirId of directoryIds) {

        const dir = await DirModel.findOne({ _id: dirId });

        if (dir) {
            await deleteFilesInDirectory(dir.files);
            await deleteNestedDirectories(dir.directories);
            await DirModel.findOneAndUpdate(
                { _id: dir.parent },
                {
                    $pull: { directories: dirId }
                });
        }
    }

    await DirModel.deleteMany({ _id: { $in: directoryIds } });
}

export const deleteDirectory = async (req, res, next) => {

    try {
        const id = req.params.id || req.dirId;
        const dirData = await DirModel.findById(id);

        if (!dirData) {
            return res.status(404).json({
                message: "Directory not found."
            })
        }

        // await deleteFilesInDirectory(dirData.files);

        await FileModel.deleteMany({dirId: id});

        // await DirModel.findOneAndUpdate(
        //     { _id: id },
        //     { $set: { files: [] } }
        // );

        // await deleteNestedDirectories(dirData.directories);

        await DirModel.deleteMany({parent: id});

        // await DirModel.findOneAndUpdate(
        //     { _id: dirData.parent },
        //     { $pull: { directories: dirData._id } }
        // );

        await DirModel.deleteOne({ _id: id });

        if(!req.dirId) {
            res.status(200).json({
                message: "Directory deleted successfully"
            });
        }

    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const renameDirectory = async (req, res, next) => {

    const dirName = req.body.newDirName;
    const id = req.params.id;

    try {
        const dirToRename = await DirModel.findById(id);

        if (!dirToRename) {
            return res.status(404).json({
                message: "Directory not found"
            });
        }

        await DirModel.findOneAndUpdate(
            { _id: id },
            { $set: { name: dirName } }
        );

        res.status(200).json({
            message: "Directory renamed successfully!"
        })

    } catch (error) {
        console.log(error);
        next(error);
    }
};