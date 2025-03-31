import { rm } from "fs/promises";
import express from 'express';
import path from "path";
import { ObjectId } from 'mongodb';
import { validateObjectId } from "../middlewares/validation.js";
import { deleteDirectory, getDirectories, makeDirecotry, renameDirectory } from "../controllers/dircontroller.js";

const router = express.Router();

// validation
router.param("id", validateObjectId);
router.param("parentId", validateObjectId);

// read
router.get("/:id?", getDirectories);

// make new directory 
router.post("/:parentId?", makeDirecotry);

// delete directory
router.delete("/:id", deleteDirectory);

// rename directory
router.patch("/:id", renameDirectory);

export default router;
