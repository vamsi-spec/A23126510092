import express from "express";
import { priorityInbox, getAllNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getAllNotifications);
router.post("/priority-inbox", priorityInbox);

export default router;
