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

        const filesRaw = await FileModel.find({dirId: id});

        const directoriesRaw = await DirModel.find({parent: id});

        const files = filesRaw.map((file) => ({ ...file._doc, id: file._id.toString() }));
        const directories = directoriesRaw.map((dir) => ({ id: dir._id.toString(), name: dir.name }));

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

export const deleteDirectory = async (req, res, next) => {

    try {
        const id = req.params.id || req.dirId;
        const dirData = await DirModel.findById(id);

        if (!dirData) {
            return res.status(404).json({
                message: "Directory not found."
            })
        }

        await FileModel.deleteMany({dirId: id});

        await DirModel.deleteMany({parent: id});

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