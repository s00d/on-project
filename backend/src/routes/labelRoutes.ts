import { Router } from 'express'
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { param, body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * /labels/{projectId}/:
 *   get:
 *     summary: Get all labels for a project
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: A list of labels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Label'
 *       400:
 *         description: Error fetching labels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error fetching labels
 */
router.get(
  '/:projectId/',
  authenticateAll,
  [param('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  getLabels
)

/**
 * @swagger
 * /labels/{projectId}/:
 *   post:
 *     summary: Create a new label in a project
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created label
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       400:
 *         description: Error creating label
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error creating label
 */
router.post(
  '/:projectId/',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    body('name').isString().withMessage('Name is required'),
    body('color').isString().withMessage('Color is required')
  ],
  validateRequest,
  createLabel
)

/**
 * @swagger
 * /labels/{projectId}/{id}:
 *   put:
 *     summary: Update a label in a project
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the label
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated label
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Label'
 *       400:
 *         description: Error updating label
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error updating label
 *       404:
 *         description: Label not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Label not found
 */
router.put(
  '/:projectId/:id',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    param('id').isInt().withMessage('Label ID must be an integer'),
    body('name').isString().withMessage('Name is required'),
    body('color').isString().withMessage('Color is required')
  ],
  validateRequest,
  updateLabel
)

/**
 * @swagger
 * /labels/{projectId}/{id}:
 *   delete:
 *     summary: Delete a label in a project
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the label
 *     responses:
 *       204:
 *         description: Label deleted successfully
 *       400:
 *         description: Error deleting label
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error deleting label
 *       404:
 *         description: Label not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Label not found
 */
router.delete(
  '/:projectId/:id',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    param('id').isInt().withMessage('Label ID must be an integer')
  ],
  validateRequest,
  deleteLabel
)

export { router as labelRouter }
