import express from "express";
import {
  autofillMyStudentProfileFromResume,
  getMyStudentProfile,
  getStudentProfileById,
  upsertMyStudentProfile,
} from "../controllers/studentProfile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, authorize("student"), getMyStudentProfile);
router.post("/me/autofill-resume", protect, authorize("student"), autofillMyStudentProfileFromResume);
router.put("/me", protect, authorize("student"), upsertMyStudentProfile);
router.get(
  "/:id",
  protect,
  authorize("student", "recruiter", "organizer", "admin"),
  getStudentProfileById
);

export default router;
