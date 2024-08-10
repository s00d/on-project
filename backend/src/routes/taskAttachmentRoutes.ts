import { Router } from 'express'
import {
  getTaskAttachments,
  addTaskAttachment,
  deleteTaskAttachment
} from '../controllers/taskAttachmentController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { check } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * /task-attachments/{taskId}/attachments:
 *   get:
 *     summary: Get all attachments for a task
 *     tags: [Task Attachments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskAttachment'
 *       404:
 *         description: Task not found
 *       400:
 *         description: Bad request
 */
router.get(
  '/:taskId/attachments',
  authenticateAll,
  [check('taskId').isInt().withMessage('Task ID must be an integer')],
  validateRequest,
  getTaskAttachments
)

/**
 * @swagger
 * /task-attachments/{taskId}/attachments:
 *   post:
 *     summary: Add an attachment to a task
 *     tags: [Task Attachments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment added
 *       400:
 *         description: Bad request or file not provided
 *       404:
 *         description: Task not found
 */
router.post(
  '/:taskId/attachments',
  authenticateAll,
  [
    check('taskId').isInt().withMessage('Task ID must be an integer'),
    check('file').custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File not provided')
      }
      return true
    })
  ],
  validateRequest,
  addTaskAttachment
)

/**
 * @swagger
 * /task-attachments/attachments/{id}:
 *   delete:
 *     summary: Delete an attachment by ID
 *     tags: [Task Attachments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the attachment
 *     responses:
 *       204:
 *         description: Attachment deleted
 *       404:
 *         description: Attachment not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/attachments/:id',
  authenticateAll,
  [check('id').isInt().withMessage('Attachment ID must be an integer')],
  validateRequest,
  deleteTaskAttachment
)

export { router as taskAttachmentRouter }
