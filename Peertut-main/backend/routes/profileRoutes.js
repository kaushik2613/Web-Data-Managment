import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/userProfileController.js";

const profileRouter = express.Router();

profileRouter.get("/:userId/profile",verifyToken, getUserProfile);
profileRouter.put("/:userId/profile",verifyToken, updateUserProfile);

export default profileRouter;
