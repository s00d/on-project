import { Router } from 'express';
import { getTaskHistory, clearTaskHistoryByTask, clearTaskHistoryByProject } from '../controllers/taskHistoryController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { check } from 'express-validator';
import {validateRequest} from "../middlewares/validateRequest";
import {isProjectCreator} from "../middlewares/roleMiddleware";

const router = Router();

/**
 * @swagger
 * /task-history/{taskId}/history:
 *   get:
 *     summary: Get task history
 *     tags: [Task History]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: List of task history entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskHistory'
 *       404:
 *         description: Task not found
 *       400:
 *         description: Bad request
 */
router.get(
  '/:taskId/history',
  authenticateAll,
  [check('taskId').isInt().withMessage('Task ID must be an integer')],
  validateRequest,
  getTaskHistory
);

/**
 * @swagger
 * /task-history/{taskId}/clear:
 *   delete:
 *     summary: Clear history for a specific task
 *     tags: [Task History]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     responses:
 *       204:
 *         description: Task history cleared successfully
 *       404:
 *         description: Task not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/:taskId/clear',
  authenticateAll,
  isProjectCreator,
  [check('taskId').isInt().withMessage('Task ID must be an integer')],
  validateRequest,
  clearTaskHistoryByTask
);

/**
 * @swagger
 * /task-history/project/{projectId}/clear:
 *   delete:
 *     summary: Clear history for all tasks in a project
 *     tags: [Task History]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     responses:
 *       204:
 *         description: Project task history cleared successfully
 *       404:
 *         description: Project not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/project/:projectId/clear',
  authenticateAll,
  isProjectCreator,
  [check('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  clearTaskHistoryByProject
);

export { router as taskHistoryRouter };
