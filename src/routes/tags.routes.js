import { Router } from "express";
import { createTag, getTags, getTagById, deleteTag } from "../controllers/tags.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createTag);
router.get("/", getTags);
router.get("/:id", getTagById);
router.delete("/:id", authMiddleware, deleteTag);

export default router;
