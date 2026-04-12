import express from "express";
import {
  createRegistration,
  getMyRegistrations,
  getOrganizerRegistrations,
  updateRegistrationStatus,
  updateRegistrationTeam,
} from "../controllers/registration.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorize("student"), createRegistration);
router.get("/my", protect, authorize("student"), getMyRegistrations);
router.get("/organizer", protect, authorize("organizer", "admin"), getOrganizerRegistrations);
router.patch(
  "/:id/status",
  protect,
  authorize("organizer", "admin"),
  updateRegistrationStatus
);
router.patch(
  "/:id/team",
  protect,
  authorize("organizer", "admin"),
  updateRegistrationTeam
);

export default router;
