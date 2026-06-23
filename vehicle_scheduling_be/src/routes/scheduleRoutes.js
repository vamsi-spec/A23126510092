import express from "express";
import { getSchedule, getDepots, getVehicles } from "../controllers/sheduleController.js";

const router = express.Router();

router.get("/depots", getDepots);
router.get("/vehicles", getVehicles);
router.post("/schedule", getSchedule);

export default router;
