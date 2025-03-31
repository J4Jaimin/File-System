import express from "express";
import { validateObjectId } from "../middlewares/validation.js";
import { deleteFile, getFile, renameFile, uploadFile } from "../controllers/filecontroller.js";

const router = express.Router();

router.param("id", validateObjectId);

// get file
router.get("/:id", getFile);

// rename file
router.patch("/:id", renameFile);

// delete file
router.delete("/:id", deleteFile);

// upload normal way
router.post("/:id?", uploadFile)


export default router;