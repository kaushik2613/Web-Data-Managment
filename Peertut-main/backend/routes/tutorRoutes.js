import express from "express";
import { getAvailableSessions, getAvailableSubjects } from "../controllers/tutorController.js";

const tutorRouter = express.Router();

// GET /api/tutors/available-sessions?subject=Math&minRating=4&maxRating=5
tutorRouter.get("/available-sessions", getAvailableSessions);

// GET /api/tutors/subjects
tutorRouter.get("/subjects", getAvailableSubjects);

export default tutorRouter;
