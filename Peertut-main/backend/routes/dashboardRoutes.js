import express from "express";
import { getTutorDashboard } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

// GET /api/dashboard/tutor/:profileId
dashboardRouter.get("/tutor/:profileId/:timeRange", getTutorDashboard);

export default dashboardRouter;
