import express from "express";
import { getHealthStatus, getTurnCredentials } from "../controllers/apiController.js";
import { submitReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getHealthStatus);
router.get("/turn-credentials", getTurnCredentials);
router.post("/reports", submitReport);

export default router;
