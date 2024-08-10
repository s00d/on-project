import { Router } from 'express';
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from '../controllers/sprintController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { isProjectCreator } from '../middlewares/roleMiddleware';
import { check } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';  // Assuming you have a middleware for handling validation errors

const router = Router();

/**
 * @swagger
 * /sprints/{projectId}/{roadmapId}:
 *   get:
 *     summary: Get all sprints for a roadmap within a project
 *     tags: [Sprints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *       - in: path
 *         name: roadmapId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the roadmap
 *     responses:
 *       200:
 *         description: List of sprints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sprint'
 *       404:
 *         description: Project or roadmap not found
 *       400:
 *         description: Bad request
 */
router.get(
  '/:projectId/:roadmapId',
  authenticateAll,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('roadmapId').isInt().withMessage('Roadmap ID must be an integer'),
  ],
  validateRequest,
  getSprints
);

/**
 * @swagger
 * /sprints/{projectId}:
 *   post:
 *     summary: Create a new sprint
 *     tags: [Sprints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the sprint
 *               description:
 *                 type: string
 *                 description: Description of the sprint
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the sprint
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the sprint
 *               roadmapId:
 *                 type: integer
 *                 description: ID of the associated roadmap
 *     responses:
 *       201:
 *         description: Sprint created
 *       403:
 *         description: Only the project owner can create sprints
 *       404:
 *         description: Project or roadmap not found
 *       400:
 *         description: Bad request
 */
router.post(
  '/:projectId',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('title').isString().notEmpty().withMessage('Title is required'),
    check('description').isString().optional(),
    check('startDate').isISO8601().toDate().withMessage('Start Date must be a valid date'),
    check('endDate').isISO8601().toDate().withMessage('End Date must be a valid date'),
    check('roadmapId').isInt().withMessage('Roadmap ID must be an integer'),
  ],
  validateRequest,
  createSprint
);

/**
 * @swagger
 * /sprints/{projectId}/{id}:
 *   put:
 *     summary: Update a sprint
 *     tags: [Sprints]
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
 *         description: ID of the sprint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the sprint
 *               description:
 *                 type: string
 *                 description: Description of the sprint
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the sprint
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the sprint
 *     responses:
 *       200:
 *         description: Sprint updated
 *       403:
 *         description: Only the project owner can update sprints
 *       404:
 *         description: Sprint not found
 *       400:
 *         description: Bad request
 */
router.put(
  '/:projectId/:id',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Sprint ID must be an integer'),
    check('title').isString().notEmpty().withMessage('Title is required'),
    check('description').isString().optional(),
    check('startDate').isISO8601().toDate().withMessage('Start Date must be a valid date'),
    check('endDate').isISO8601().toDate().withMessage('End Date must be a valid date'),
  ],
  validateRequest,
  updateSprint
);

/**
 * @swagger
 * /sprints/{projectId}/{id}:
 *   delete:
 *     summary: Delete a sprint
 *     tags: [Sprints]
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
 *         description: ID of the sprint
 *     responses:
 *       204:
 *         description: Sprint deleted
 *       403:
 *         description: Only the project owner can delete sprints
 *       404:
 *         description: Sprint not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/:projectId/:id',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Sprint ID must be an integer'),
  ],
  validateRequest,
  deleteSprint
);

export { router as sprintRouter };
