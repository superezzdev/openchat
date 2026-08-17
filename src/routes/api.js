import express from "express";
import { getHealthStatus } from "../controllers/apiController.js";
import { submitReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getHealthStatus);
router.post("/reports", submitReport);

export default router;
