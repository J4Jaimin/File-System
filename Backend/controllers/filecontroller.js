import mongoose from 'mongoose';
import path from 'path';
import FileModel from '../models/filemodel.js';
import fs from 'fs/promises';
import { createWriteStream } from "fs";
import DirModel from '../models/dirmodel.js';
import usermodel from '../models/usermodel.js';
import Session from '../models/sessionmodel.js';

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(path.resolve(import.meta.dirname, '..'), "storage");
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         const fileExtension = path.extname(file.originalname);
//         cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
//     },
// });

// const upload = multer({ storage });
export const getFile = async (req, res, next) => {

    const id = req.params.id || "";

    try {
        const file = await FileModel.findById(id);
        const directory = await DirModel.findById(file.dirId);

        const fileName = path.join('/', file._id + file.ext);
        const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);

        const sid = req.signedCookies.sid;
        const s = await Session.findById(sid);
        const uid = s.userId;

        if (uid.toString() !== directory.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to access this file."
            });
        }

        if (!file) {
            return res.status(404).json({
                message: "File not found."
            });
        }

        if (req.query.action === "download") {
            return res.download(filePath, file.name);
        }

        return res.status(200).sendFile(filePath);

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const renameFile = async (req, res, next) => {

    const id = req.params.id;
    console.log(id);
    const newFileName = req.body.newFilename;
    const db = req.db;

    try {

        const fileToBeRename = await FileModel.findById(id);
        const directory = await DirModel.findById(fileToBeRename.dirId);

        if (JSON.parse(req.signedCookies.token).uid !== directory.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to rename this file."
            });
        }

        await FileModel.findOneAndUpdate(
            { _id: id },
            { $set: { name: newFileName } }
        );

        return res.status(200).json({
            message: "File renamed successfully"
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const deleteFile = async (req, res, next) => {

    const id = req.params.id;

    try {
        const file = await FileModel.findById(id);
        const directory = await DirModel.findById(file.dirId);

        if (JSON.parse(req.signedCookies.token).uid !== String(directory.userId)) {
            return res.status(403).json({
                message: "You are not authorized to delete this file."
            });
        }

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const filePath = path.join('/', file._id.toString() + file.ext);

        await FileModel.deleteOne({ _id: id });

        await DirModel.findOneAndUpdate(
            { _id: file.dirId },
            { $pull: { files: id } }
        );

        await fs.unlink(path.join(path.resolve(import.meta.dirname, '..'), "storage", filePath));

        return res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

export const uploadFile = async (req, res, next) => {

    let fileName = req.headers.filename || "untitled";
    let sid = req.signedCookies.sid;
    const s = await Session.findById(sid);
    const uid = s.userId;
    const user = await usermodel.findById(uid);
    const ext = path.extname(fileName);
    const session = await mongoose.startSession();

    try {
        const dir = await DirModel.findOne({ name: `root-${user.email}` });
        const dirId = req.params.id ? req.params.id : dir._id;

        session.startTransaction();

        const insertedFile = await FileModel.create([{
            ext,
            name: fileName,
            dirId,
        }], { session });

        await DirModel.updateOne(
            { _id: dirId },
            { $push: { files: insertedFile[0]._id } },
            { session }
        );

        const fullName = path.join('/', insertedFile[0]._id + ext);
        const writeStream = await createWriteStream(`./storage/${fullName}`);

        req.pipe(writeStream);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "File uploaded successfully",
            file: insertedFile[0],
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error uploading file:', error);
        return res.status(500).send('An error occurred while uploading the file.');
    } finally {
        session.endSession();
    }
};

// upload file using multer
// router.post("/:filename", upload.single("file"), async (req, res, next) => {

//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   console.log("Uploaded File:", req.file);

//   res.status(200).json({
//     message: "File uploaded successfully",
//     file: req.file,
//   });
// })

