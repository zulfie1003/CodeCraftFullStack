import express from "express";
import {
  createApplication,
  getMyApplications,
  getRecruiterApplications,
  updateApplicationStatus,
} from "../controllers/application.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), createApplication);
router.get("/my", protect, authorize("student"), getMyApplications);
router.get("/recruiter", protect, authorize("recruiter", "admin"), getRecruiterApplications);
router.patch(
  "/:id/status",
  protect,
  authorize("recruiter", "admin"),
  updateApplicationStatus
);

export default router;
