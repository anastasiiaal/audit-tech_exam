import { Router } from "express";
import dashboardController from "../controllers/DashboardController";

const router = Router();

router.get(
  "/summary",
  dashboardController.getSummary.bind(dashboardController)
);

export default router;
