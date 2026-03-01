import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAllSubjects } from "../controllers/subjectsController.js";

const subjectRouter = express.Router();

subjectRouter.get('/all',verifyToken,getAllSubjects);

export default subjectRouter;