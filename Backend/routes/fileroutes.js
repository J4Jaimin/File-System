import express from "express";
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { createWriteStream } from "fs";
import { ObjectId } from "mongodb";
import { validateObjectId } from "../middlewares/validation.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(path.resolve(import.meta.dirname, '..'), "storage");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
});

const upload = multer({ storage });

router.param("id", validateObjectId);

router.get("/:id", async (req, res, next) => {

    const id = req.params.id || "";
    const db = req.db;

    try {
        const file = await db.collection("files").findOne({ _id: new ObjectId(id) });
        const directory = await db.collection("directories").findOne({ _id: file.dirId });

        const fileName = path.join('/', file._id.toString() + file.ext);
        const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);

        if (req.cookies.uid !== directory.userId.toString()) {
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
});

// rename file
router.patch("/:id", async (req, res, next) => {

    const id = req.params.id;
    console.log(id);
    const newFileName = req.body.newFilename;
    const db = req.db;

    try {

        const fileToBeRename = await db.collection("files").findOne({ _id: new ObjectId(id) });
        const directory = await db.collection("directories").findOne({ _id: fileToBeRename.dirId });

        if (req.cookies.uid !== directory.userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to rename this file."
            });
        }

        await db.collection("files").findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { name: newFileName } }
        );

        return res.status(200).json({
            message: "File renamed successfully"
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
});

// delete file
router.delete("/:id", async (req, res, next) => {

    const id = req.params.id;
    const db = req.db;

    try {
        const file = await db.collection("files").findOne({ _id: new ObjectId(id) });
        const directory = await db.collection("directories").findOne({ _id: file.dirId });

        if (req.cookies.uid !== directory.userId.toString()) {
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

        await db.collection("files").deleteOne({ _id: new ObjectId(id) });

        await db.collection("directories").findOneAndUpdate(
            { _id: file.dirId },
            { $pull: { files: new ObjectId(id) } }
        );

        await fs.unlink(path.join(path.resolve(import.meta.dirname, '..'), "storage", filePath));

        return res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
});

// upload normal way
router.post("/:id?", async (req, res, next) => {

    let fileName = req.headers.filename || "untitled";
    const { email, uid } = req.cookies;
    const ext = path.extname(fileName);
    const db = req.db;

    try {
        const dir = await db.collection('directories').findOne({ name: `root-${email}` });
        const dirId = req.params.id ? new ObjectId(req.params.id) : dir._id;

        const insertedFile = await db.collection("files").insertOne({
            ext,
            name: fileName,
            dirId,
        });

        await db.collection('directories').updateOne(
            { _id: dirId },
            { $push: { files: insertedFile.insertedId } }
        );

        const fullName = path.join('/', insertedFile.insertedId + ext);
        const writeStream = await createWriteStream(`./storage/${fullName}`);

        req.pipe(writeStream);

        req.on('end', () => {
            return res.status(201).json({
                message: "File uploaded successfully"
            });
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).send('An error occurred while uploading the file.');
    }
})

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

export default router;