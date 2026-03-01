import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { connectDB, sequelize } from "./models/index.js";
import profileRouter from "./routes/profileRoutes.js";
import { seedSubjects } from "./util/seedSubjects.js";
import subjectRouter from "./routes/subjectRoutes.js";
import sessionRouter from "./routes/sessionRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import sendEmailRouter from "./routes/sendEmailRoutes.js";
import studyPlanRouter from "./routes/studyPlan.routes.js";
import tutorRouter from "./routes/tutorRoutes.js";
import ratingRouter from "./routes/ratingRoutes.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`],
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "DELETE") {
    return next();
  }
  express.json()(req, res, next);
});
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRouter);
app.use("/api/subjects", subjectRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/sendEmail', sendEmailRouter);
app.use("/api/study-plans", studyPlanRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/tutors', tutorRouter);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync();
  await seedSubjects();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
