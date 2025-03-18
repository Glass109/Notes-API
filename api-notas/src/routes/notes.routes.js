import express from "express";
import { getNotes, getNote, createNote, updateNote, deleteNote, archiveNote } from "../controllers/notes.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotes);
router.get("/:id", authMiddleware, getNote);
router.post("/", authMiddleware, createNote);
router.put("/:id", authMiddleware, updateNote);
router.patch("/:id/archive", authMiddleware, archiveNote);
router.delete("/:id", authMiddleware, deleteNote);

export default router;