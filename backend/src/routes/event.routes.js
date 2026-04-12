import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/manage/mine", protect, authorize("organizer", "admin"), getMyEvents);
router.get("/:id", getEventById);
router.post("/", protect, authorize("organizer", "admin"), createEvent);
router.put("/:id", protect, authorize("organizer", "admin"), updateEvent);

export default router;
