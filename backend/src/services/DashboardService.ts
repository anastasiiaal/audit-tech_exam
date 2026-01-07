import taskRepository from "../repositories/TaskRepository";
import pool from "../config/database";

export class DashboardService {
  async getSummary() {
    const todoCount = await taskRepository.countByStatus("todo");
    const inProgressCount = await taskRepository.countByStatus("in_progress");
    const doneCount = await taskRepository.countByStatus("done");
    const totalTimeLogged = await taskRepository.getTotalTimeLogged();

    const recentTasksResult = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 5"
    );

    return {
      tasksByStatus: {
        todo: todoCount,
        in_progress: inProgressCount,
        done: doneCount,
      },
      totalTasks: todoCount + inProgressCount + doneCount,
      totalTimeLoggedSeconds: totalTimeLogged,
      recentTasks: recentTasksResult.rows,
    };
  }
}

export default new DashboardService();
