import { Router } from 'express'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  inviteUser,
  getProjectUsers,
  getProject,
  deActiveUser
} from '../controllers/projectController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'
import { check, param, body } from 'express-validator'
import { validateRequest } from '../middlewares/validateRequest'

const router = Router()

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects for the logged-in user
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/', authenticateAll, getProjects)

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: The created project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post(
  '/',
  authenticateAll,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  validateRequest,
  createProject
)

/**
 * @swagger
 * /projects/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: The project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get(
  '/:projectId',
  authenticateAll,
  [param('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  getProject
)

/**
 * @swagger
 * /projects/{projectId}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: The updated project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       403:
 *         description: Only the project owner can update the project
 */
router.put(
  '/:projectId',
  authenticateAll,
  isProjectCreator,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('customFields').optional().isObject().withMessage('Custom fields must be an object'),
    body('priorities').optional().isArray().withMessage('Priorities must be an array'),
    body('statuses').optional().isArray().withMessage('Statuses must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('types').optional().isArray().withMessage('Types must be an array'),
    body('savedFilters').optional().isArray().withMessage('Saved filters must be an array')
  ],
  validateRequest,
  updateProject
)

/**
 * @swagger
 * /projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project to delete
 *     responses:
 *       204:
 *         description: Project successfully deleted
 *       403:
 *         description: Only the project owner can delete the project
 */
router.delete(
  '/:projectId',
  authenticateAll,
  isProjectCreator,
  [param('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  deleteProject
)

/**
 * @swagger
 * /projects/{projectId}/invite:
 *   post:
 *     summary: Invite a user to the project
 *     tags: [Projects]
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
 *               userId:
 *                 type: integer
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User invited successfully
 *       403:
 *         description: Only the project owner can invite users
 *       404:
 *         description: User not found
 */
router.post(
  '/:projectId/invite',
  authenticateAll,
  isProjectCreator,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    body('userId').optional().isInt().withMessage('User ID must be an integer'),
    body('email').optional().isEmail().withMessage('Email must be a valid email address'),
    body('username').optional().isString().withMessage('Username must be a string')
  ],
  validateRequest,
  inviteUser
)

/**
 * @swagger
 * /projects/{projectId}/users:
 *   get:
 *     summary: Get all users in a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: List of users in the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  '/:projectId/users',
  authenticateAll,
  [param('projectId').isInt().withMessage('Project ID must be an integer')],
  validateRequest,
  getProjectUsers
)

/**
 * @swagger
 * /projects/{projectId}/users/{userId}:
 *   delete:
 *     summary: Deactivate (remove) a user from the project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the project
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to deactivate
 *     responses:
 *       204:
 *         description: User successfully deactivated
 *       403:
 *         description: Only the project owner can remove users from the project
 *       404:
 *         description: User not found in project
 */
router.delete(
  '/:projectId/users/:userId',
  authenticateAll,
  isProjectCreator,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    param('userId').isInt().withMessage('User ID must be an integer')
  ],
  validateRequest,
  deActiveUser
)

export { router as projectRouter }
