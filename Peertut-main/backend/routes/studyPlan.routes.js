import express from "express";
import {
  getUserStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
} from "../controllers/studyPlanController.js";

const router = express.Router();

router.get("/user/:userId", getUserStudyPlans);
router.post("/", createStudyPlan);
router.put("/:id", updateStudyPlan);
router.delete("/:id", deleteStudyPlan);

export default router;
