import { Router } from "express";
import taskController from "../controllers/TaskController";

const router = Router();

router.get("/", taskController.getTasks.bind(taskController));
router.post("/", taskController.createTask.bind(taskController));
router.patch(
  "/:id/status",
  taskController.updateTaskStatus.bind(taskController)
);
router.post("/:id/start", taskController.startTimer.bind(taskController));
router.post("/:id/stop", taskController.stopTimer.bind(taskController));

export default router;
