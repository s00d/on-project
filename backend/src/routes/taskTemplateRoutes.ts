import { Router } from 'express'
import { getTemplates, createTemplate, deleteTemplate } from '../controllers/taskTemplateController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { check, validationResult } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * /task-templates:
 *   get:
 *     summary: Get all task templates for the authenticated user
 *     tags: [Task Templates]
 *     responses:
 *       200:
 *         description: List of task templates
 *       400:
 *         description: Bad request
 */
router.get('/', authenticateAll, getTemplates)

/**
 * @swagger
 * /task-templates:
 *   post:
 *     summary: Create a new task template
 *     tags: [Task Templates]
 *     requestBody:
 *       description: Task template data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Task Template"
 *               description:
 *                 type: string
 *                 example: "This is a description for the new task template."
 *               priority:
 *                 type: string
 *                 example: "Medium"
 *               status:
 *                 type: string
 *                 example: "To Do"
 *               tag:
 *                 type: string
 *                 example: "Feature"
 *               type:
 *                 type: string
 *                 example: "Development"
 *     responses:
 *       201:
 *         description: Task template created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  authenticateAll,
  [
    check('title').isString().withMessage('Title is required and should be a string'),
    check('description').optional().isString().withMessage('Description should be a string'),
    check('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Priority should be Low, Medium, or High'),
    check('status').optional().isString().withMessage('Status should be a string'),
    check('tag').optional().isString().withMessage('Tag should be a string'),
    check('type').optional().isString().withMessage('Type should be a string')
  ],
  validateRequest,
  createTemplate
)

/**
 * @swagger
 * /task-templates/{id}:
 *   delete:
 *     summary: Delete a task template by ID
 *     tags: [Task Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task template
 *     responses:
 *       204:
 *         description: Task template deleted successfully
 *       404:
 *         description: Task template not found
 */
router.delete(
  '/:id',
  authenticateAll,
  [check('id').isInt().withMessage('ID should be a valid integer')],
  validateRequest,
  deleteTemplate
)

export { router as taskTemplateRouter }
