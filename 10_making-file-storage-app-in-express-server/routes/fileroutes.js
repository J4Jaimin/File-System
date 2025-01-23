import express from "express";
import path from 'path';
import fs, { writeFile } from 'fs/promises';
import multer from 'multer';
import { createWriteStream, write } from "fs";
import fileData from "../utils/filesdata.json" with {type: "json"};
import dirData from '../utils/foldersdata.json' with {type: "json"};

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

router.get("/:id", async (req, res, next) => {

    try {
        const id = req.params.id;

        const file = fileData.files.find((file) => file.id === id);

        if (!file) {
            res.status(404).json({
                message: "File not found"
            });
        }

        const fileName = path.join('/', file.id + file.ext);
        const filePath = path.join(path.resolve(import.meta.dirname, '..'), "storage", fileName);

        res.sendFile(filePath);

    } catch (error) {
        console.log(error);
    }

});

// rename file
router.patch("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const newFileName = req.body.fileName;

        fileData.files.find((file) => file.id === id).fileName = newFileName;

        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));

        res.json({
            message: "File renamed successfully"
        });

    } catch (error) {
        console.log(error);
    }
});

// delete file
router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const file = fileData.files.find((file) => file.id === id);
        console.log(file);
        const filePath = path.join('/', file.id + file.ext);

        fileData.files = fileData.files.filter((file) => file.id !== id);

        const fileDir = dirData.dirs.find((dir) => dir.id === file.dirId);

        fileDir.files = fileDir.files.filter((fileId) => fileId !== id);

        dirData.dirs.map((dir) => {
            dir.id = fileDir.id;
        })

        await fs.unlink(path.join(path.resolve(import.meta.dirname, '..'), "storage", filePath));

        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));

        await writeFile("./utils/foldersdata.json", JSON.stringify(dirData));

        res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.log(error);
    }
});

// upload normal way
router.post("/:filename", async (req, res, next) => {
    try {
        let fileName = req.params.filename;
        const ext = path.extname(fileName);
        const id = crypto.randomUUID();
        const fullName = path.join('/', id + ext);

        fileData.files.push({
            id,
            ext,
            fileName
        });

        await writeFile("./utils/filesdata.json", JSON.stringify(fileData));

        const writeStream = await createWriteStream(`./storage/${fullName}`);

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