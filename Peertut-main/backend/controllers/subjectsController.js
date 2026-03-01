import { Subject } from "../models/subject.model.js";

export const getAllSubjects = async (req, res) => {
    try {
      const subjects = await Subject.findAll();
      res.status(200).json({
        message: "Subjects fetched successfully",
        data: subjects,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};