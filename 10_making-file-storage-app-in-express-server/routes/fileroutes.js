import express from "express";
import path from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import { createWriteStream } from "fs";

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

router.get("/*", async (req, res, next) => {
    console.log(req.params);
    const fileSubPath = path.join("/", req.params[0]);
    console.log(fileSubPath);
    const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileSubPath);

    res.sendFile(filePath);
});

// rename file
router.patch("/*", async (req, res, next) => {
    const fileName = path.join('/', req.params[0]);
    console.log(fileName);
    const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);
    const newFileName = req.body.newFilename;

    try {
        await fs.rename(filePath, path.join(path.resolve(import.meta.dirname, '..'), "storage", newFileName));
        res.status(200).json({
            message: "File renamed successfully"
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send('File not found.');
        } else {
            console.error('Error renaming file:', error.message);
            res.status(500).send('An error occurred while renaming the file.');
        }
    }
});

// delete file
router.delete("/*", async (req, res, next) => {
    const fileName = path.join('/', req.params[0]);
    console.log(fileName);
    const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);

    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            await fs.rm(filePath, { recursive: true, force: true });
            res.status(200).json({
                message: "Directory deleted successfully",
            });
        } else if (stats.isFile()) {
            await fs.unlink(filePath);
            res.status(200).json({
                message: "File deleted successfully",
            });
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).send('File not found.');
        } else {
            console.error('Error deleting file:', error);
            res.status(500).send('An error occurred while deleting the file.');
        }
    }
});

// upload normal way
router.post("/*", async (req, res, next) => {
    try {
        const fileName = path.join('/', req.params[0]);
        const writeStream = await createWriteStream(`./storage/${fileName}`);

        req.pipe(writeStream);

        req.on('end', () => {
            res.status(200).json({
                message: "File uploaded successfully"
            });
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('An error occurred while uploading the file.');
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