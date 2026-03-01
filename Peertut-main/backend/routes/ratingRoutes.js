import express from "express";
import { getTutorRatings, rateSession, updateRating } from "../controllers/ratingController.js";


const ratingRouter = express.Router();

// POST /api/ratings/session/:sessionId - Submit a rating
ratingRouter.post("/session/:sessionId", rateSession);

// PUT /api/ratings/session/:sessionId - Update a rating
ratingRouter.put("/session/:sessionId", updateRating);

// GET /api/ratings/tutor/:profileId - Get all ratings for a tutor
ratingRouter.get("/tutor/:profileId", getTutorRatings);

export default ratingRouter;
