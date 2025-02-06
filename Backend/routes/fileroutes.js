import express from "express";
import path from 'path';
import fs, { writeFile } from 'fs/promises';
import multer from 'multer';
import { createWriteStream, write } from "fs";
import fileData from "../utils/filesdata.json" with {type: "json"};
import dirData from '../utils/foldersdata.json' with {type: "json"};
import { dir } from "console";
import { validateUuid } from "../middlewares/validation.js";

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

router.param("id", validateUuid);

router.get("/:id", async (req, res, next) => {

    try {
        const id = req.params.id || "";

        const file = fileData.files.find((file) => file.id === id);
        const directory = dirData.dirs.find((dir) => dir.id === file.dirId);
        const fileName = path.join('/', file.id + file.ext);
        const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);

        if (req.cookies.uid !== directory.userId) {
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
            // res.set("Content-Disposition", `attachment; filename=${file.name}`);
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

    console.log(newFileName);

    const fileToBeRename = fileData.files.find((file) => file.id === id);
    const directory = dirData.dirs.find((dir) => dir.id === fileToBeRename.dirId);

    if (req.cookies.uid !== directory.userId) {
        return res.status(403).json({
            message: "You are not authorized to rename this file."
        });
    }

    fileToBeRename.name = newFileName;

    try {
        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));
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
    const file = fileData.files.find((file) => file.id === id);

    const directory = dirData.dirs.find((dir) => dir.id === file.dirId);

    if (req.cookies.uid !== directory.userId) {
        return res.status(403).json({
            message: "You are not authorized to delete this file."
        });
    }

    if (!file) {
        return res.status(404).json({
            message: "File not found"
        });
    }

    const filePath = path.join('/', file.id + file.ext);

    fileData.files = fileData.files.filter((file) => file.id !== id);

    const fileDir = dirData.dirs.find((dir) => dir.id === file.dirId);

    fileDir.files = fileDir.files.filter((fileId) => fileId !== id);

    dirData.dirs.find((dir) => dir.id === fileDir.id).files = fileDir.files;

    try {
        await fs.unlink(path.join(path.resolve(import.meta.dirname, '..'), "storage", filePath));
        await writeFile(path.resolve(import.meta.dirname, '..', "/utils/filesdata.json"), JSON.stringify(fileData));
        await writeFile(path.resolve(import.meta.dirname, '..', "/utils/filesdata.json"), JSON.stringify(dirData));

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
    const { email } = req.cookies;
    const ext = path.extname(fileName);
    const id = crypto.randomUUID();
    const fullName = path.join('/', id + ext);
    const dirId = req.params.id || dirData.dirs.find((dir) => dir.name === `root-${email}`).id;

    dirData.dirs.find((dir) => dir.id === dirId).files.push(id);

    fileData.files.push({
        id,
        ext,
        name: fileName,
        dirId,
    });

    try {
        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));

        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

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