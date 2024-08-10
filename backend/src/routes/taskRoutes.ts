import { Router } from 'express'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'
import { check, validationResult } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * /tasks/{projectId}:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       # Add other query parameters here
 *     responses:
 *       200:
 *         description: List of tasks
 *       400:
 *         description: Bad request
 */
router.get(
  '/:projectId',
  authenticateAll,
  [check('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  getTasks
)

/**
 * @swagger
 * /tasks/{projectId}:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       # Add other parameters in the body
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/:projectId',
  authenticateAll,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('title').isString().withMessage('Title is required and should be a string'),
    check('description').optional({ nullable: true }).isString().withMessage('Description should be a string'),
    check('status').isString().withMessage('Status is required and should be a string'),
    check('priority').optional({ nullable: true }).isString().withMessage('Priority should be a string'),
    check('dueDate').optional({ nullable: true }).isISO8601().toDate().withMessage('Due date should be a valid date'),
    check('assignees').optional({ nullable: true }).isArray().withMessage('Assignees should be an array of user IDs'),
    check('labelId').optional({ nullable: true }).isInt().withMessage('Label ID should be an integer'),
    check('sprintId').optional({ nullable: true }).isInt().withMessage('Sprint ID should be an integer')
  ],
  validateRequest,
  createTask
)

/**
 * @swagger
 * /tasks/{projectId}/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get(
  '/:projectId/:id',
  authenticateAll,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Task ID must be an integer')
  ],
  validateRequest,
  getTask
)

/**
 * @swagger
 * /tasks/{projectId}/{id}:
 *   put:
 *     summary: Update a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *       # Add other parameters in the body
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put(
  '/:projectId/:id',
  authenticateAll,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Task ID must be an integer'),
    check('title').optional({ nullable: true }).isString().withMessage('Title should be a string'),
    check('description').optional({ nullable: true }).isString().withMessage('Description should be a string'),
    check('status').optional({ nullable: true }).isString().withMessage('Status should be a string'),
    check('priority').optional({ nullable: true }).isString().withMessage('Priority should be a string'),
    check('dueDate').optional({ nullable: true }).isISO8601().toDate().withMessage('Due date should be a valid date'),
    check('assignees').optional({ nullable: true }).isArray().withMessage('Assignees should be an array of user IDs'),
    check('labelId').optional({ nullable: true }).isInt().withMessage('Label ID should be an integer'),
    check('sprintId').optional({ nullable: true }).isInt().withMessage('Sprint ID should be an integer')
  ],
  validateRequest,
  updateTask
)

/**
 * @swagger
 * /tasks/{projectId}/{id}:
 *   delete:
 *     summary: Delete a specific task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:projectId/:id',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Task ID must be an integer')
  ],
  validateRequest,
  deleteTask
)

export { router as taskRouter }
