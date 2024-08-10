import { Router } from 'express'
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/commentController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { body, param } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
 */

/**
 * @swagger
 * /comments/{taskId}:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Task not found
 */
router.get(
  '/:taskId',
  authenticateAll,
  [param('taskId').isInt().withMessage('Task ID must be an integer')],
  validateRequest,
  getComments
)

/**
 * @swagger
 * /comments/{id}:
 *   post:
 *     summary: Add a new comment to a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *               userId:
 *                 type: integer
 *                 description: ID of the user making the comment
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: File attachment
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Task or user not found
 */
router.post(
  '/:id',
  authenticateAll,
  [
    param('id').isInt().withMessage('Task ID must be an integer'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('userId').isInt().withMessage('User ID must be an integer')
  ],
  validateRequest,
  addComment
)

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
router.put(
  '/:id',
  authenticateAll,
  [
    param('id').isInt().withMessage('Comment ID must be an integer'),
    body('content').isString().notEmpty().withMessage('Content is required')
  ],
  validateRequest,
  updateComment
)

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/:id',
  authenticateAll,
  [param('id').isInt().withMessage('Comment ID must be an integer')],
  validateRequest,
  deleteComment
)

export { router as commentRouter }
