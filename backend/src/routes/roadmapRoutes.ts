import { Router } from 'express';
import {
  getRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap
} from '../controllers/roadmapController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { isProjectCreator } from '../middlewares/roleMiddleware';
import { check } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';  // Assuming you have a middleware for handling validation errors

const router = Router();

/**
 * @swagger
 * /roadmaps/{projectId}:
 *   get:
 *     summary: Get all roadmaps for a project
 *     tags: [Roadmaps]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of roadmaps
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Roadmap'
 *       404:
 *         description: Project not found
 *       400:
 *         description: Bad request
 */
router.get(
  '/:projectId',
  authenticateAll,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
  ],
  validateRequest,
  getRoadmaps
);

/**
 * @swagger
 * /roadmaps/{projectId}:
 *   post:
 *     summary: Create a new roadmap
 *     tags: [Roadmaps]
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
 *                 description: Title of the roadmap
 *               description:
 *                 type: string
 *                 description: Description of the roadmap
 *     responses:
 *       201:
 *         description: Roadmap created
 *       403:
 *         description: Only the project owner can create roadmaps
 *       404:
 *         description: Project not found
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
  ],
  validateRequest,
  createRoadmap
);

/**
 * @swagger
 * /roadmaps/{projectId}/{id}:
 *   put:
 *     summary: Update a roadmap
 *     tags: [Roadmaps]
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
 *         description: ID of the roadmap
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the roadmap
 *               description:
 *                 type: string
 *                 description: Description of the roadmap
 *     responses:
 *       200:
 *         description: Roadmap updated
 *       403:
 *         description: Only the project owner can update roadmaps
 *       404:
 *         description: Roadmap or project not found
 *       400:
 *         description: Bad request
 */
router.put(
  '/:projectId/:id',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Roadmap ID must be an integer'),
    check('title').isString().notEmpty().withMessage('Title is required'),
    check('description').isString().optional(),
  ],
  validateRequest,
  updateRoadmap
);

/**
 * @swagger
 * /roadmaps/{projectId}/{id}:
 *   delete:
 *     summary: Delete a roadmap
 *     tags: [Roadmaps]
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
 *         description: ID of the roadmap
 *     responses:
 *       204:
 *         description: Roadmap deleted
 *       403:
 *         description: Only the project owner can delete roadmaps
 *       404:
 *         description: Roadmap or project not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/:projectId/:id',
  authenticateAll,
  isProjectCreator,
  [
    check('projectId').isInt().withMessage('Project ID must be an integer'),
    check('id').isInt().withMessage('Roadmap ID must be an integer'),
  ],
  validateRequest,
  deleteRoadmap
);

export { router as roadmapRouter };
