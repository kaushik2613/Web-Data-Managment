import { StudyPlan } from "../models/studyPlan.model.js";
import { StudyPlanTask } from "../models/studyPlanTask.model.js";

// Get all study plans for a user with tasks included
export const getUserStudyPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const plans = await StudyPlan.findAll({
      where: { userId },
      include: [{ model: StudyPlanTask, as: "tasksList" }],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ studyPlans: plans });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch study plans", error: error.message });
  }
};

// Create a new study plan with nested tasks
export const createStudyPlan = async (req, res) => {
  try {
    const {
      userId,
      title,
      academicGoal,
      subject,
      timeline,
      deadline,
      description,
      tasksList = [],
    } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ message: "userId and title are required" });
    }

    const tasks = tasksList.length;
    const completed = tasksList.filter((t) => t.completed).length;
    const progress = tasks > 0 ? Math.round((completed / tasks) * 100) : 0;

    const newPlan = await StudyPlan.create({
      userId,
      title,
      academicGoal,
      subject,
      timeline,
      deadline,
      description,
      tasks,
      completed,
      progress,
    });

    // Create tasks, removing task 'id' to prevent manual id insertion issues
    const taskPromises = tasksList.map((task) => {
      const { id, ...taskData } = task;
      return StudyPlanTask.create({ ...taskData, studyPlanId: newPlan.id });
    });
    await Promise.all(taskPromises);

    const createdPlan = await StudyPlan.findByPk(newPlan.id, {
      include: [{ model: StudyPlanTask, as: "tasksList" }],
    });

    return res.status(201).json({ studyPlan: createdPlan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create study plan", error: error.message });
  }
};

// Update existing study plan and replace tasks
export const updateStudyPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const {
      title,
      academicGoal,
      subject,
      timeline,
      deadline,
      description,
      tasksList = [],
    } = req.body;

    const plan = await StudyPlan.findByPk(planId, {
      include: [{ model: StudyPlanTask, as: "tasksList" }],
    });
    if (!plan) return res.status(404).json({ message: "Study plan not found" });

    plan.title = title ?? plan.title;
    plan.academicGoal = academicGoal ?? plan.academicGoal;
    plan.subject = subject ?? plan.subject;
    plan.timeline = timeline ?? plan.timeline;
    plan.deadline = deadline ?? plan.deadline;
    plan.description = description ?? plan.description;

    // Delete old tasks before recreating new ones
    await StudyPlanTask.destroy({ where: { studyPlanId: planId } });

    // Create new tasks, omitting 'id' to prevent insertion errors
    const taskPromises = tasksList.map((task) => {
      const { id, ...taskData } = task;
      return StudyPlanTask.create({ ...taskData, studyPlanId: planId });
    });
    await Promise.all(taskPromises);

    const tasks = tasksList.length;
    const completed = tasksList.filter((t) => t.completed).length;
    const progress = tasks > 0 ? Math.round((completed / tasks) * 100) : 0;

    plan.tasks = tasks;
    plan.completed = completed;
    plan.progress = progress;

    await plan.save();

    const updatedPlan = await StudyPlan.findByPk(planId, {
      include: [{ model: StudyPlanTask, as: "tasksList" }],
    });

    return res.status(200).json({ studyPlan: updatedPlan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update study plan", error: error.message });
  }
};

// Delete study plan and its tasks
export const deleteStudyPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const plan = await StudyPlan.findByPk(planId);
    if (!plan) return res.status(404).json({ message: "Study plan not found" });

    await StudyPlanTask.destroy({ where: { studyPlanId: planId } });
    await plan.destroy();

    return res.status(200).json({ message: "Study plan deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete study plan", error: error.message });
  }
};
