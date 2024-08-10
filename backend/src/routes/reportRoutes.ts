import { Router } from 'express';
import {
  generateReport,
  generatePriorityReport,
  generateOverdueReport,
  generateTeamPerformanceReport,
  generatePriorityDistributionReport,
  generateProgressReport,
  generateTeamWorkloadReport,
  generateUniversalReport
} from '../controllers/reportController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { check, query, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

/**
 * @swagger
 * /reports/project/{projectId}:
 *   get:
 *     summary: Generate a basic project report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: The user ID to filter tasks
 *     responses:
 *       200:
 *         description: The generated report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: string
 *                 description:
 *                   type: string
 *                 completedTasks:
 *                   type: integer
 *                 totalTasks:
 *                   type: integer
 *                 taskStatusDistribution:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
    query('user').optional().isInt().withMessage('User ID must be an integer'),
  ],
  validateRequest,
  generateReport
);

/**
 * @swagger
 * /reports/project/{projectId}/priority_distribution:
 *   get:
 *     summary: Generate a priority distribution report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *         description: The period to filter tasks
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: The user ID to filter tasks
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [priority, status]
 *         description: The type of distribution to generate
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The priority distribution report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/priority_distribution',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('period').optional().isIn(['all', 'week', 'month', 'year']).withMessage('Period must be one of [all, week, month, year]'),
    query('user').optional().isInt().withMessage('User ID must be an integer'),
    query('type').optional().isIn(['priority', 'status']).withMessage('Type must be one of [priority, status]'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generatePriorityDistributionReport
);

/**
 * @swagger
 * /reports/project/{projectId}/overdue:
 *   get:
 *     summary: Generate an overdue tasks report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The overdue tasks report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/overdue',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generateOverdueReport
);

/**
 * @swagger
 * /reports/project/{projectId}/performance:
 *   get:
 *     summary: Generate a team performance report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The team performance report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   total:
 *                     type: integer
 *                   completed:
 *                     type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/performance',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generateTeamPerformanceReport
);

/**
 * @swagger
 * /reports/project/{projectId}/priority:
 *   get:
 *     summary: Generate a priority report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: The user ID to filter tasks
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The priority report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/priority',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('user').optional().isInt().withMessage('User ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generatePriorityReport
);

/**
 * @swagger
 * /reports/project/{projectId}/progress:
 *   get:
 *     summary: Generate a progress report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The progress report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   total:
 *                     type: integer
 *                   completed:
 *                     type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/progress',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generateProgressReport
);

/**
 * @swagger
 * /reports/project/{projectId}/workload:
 *   get:
 *     summary: Generate a team workload report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The project ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start date for filtering tasks
 *     responses:
 *       200:
 *         description: The team workload report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Project not found
 */
router.get(
  '/project/:projectId/workload',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
  ],
  validateRequest,
  generateTeamWorkloadReport
);

/**
 * @swagger
 * /reports/project/{projectId}/universal:
 *   post:
 *     summary: Generate a universal report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *                 example: "Task"
 *               fields:
 *                 type: array
 *                 items:
 *                   type: string
 *               filters:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *               groupBy:
 *                 type: string
 *               sortBy:
 *                 type: string
 *               sortOrder:
 *                 type: string
 *                 enum: [ASC, DESC]
 *                 default: ASC
 *               chartType:
 *                 type: string
 *                 enum: [bar, pie]
 *                 default: bar
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: The generated universal report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chartType:
 *                   type: string
 *                 reportData:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid request parameters
 */
router.post(
  '/project/:projectId/universal',
  authenticateAll,
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    check('model').isIn(['Task', 'User', 'Project', 'Sprint', 'Label']).withMessage('Invalid model selected'),
    check('fields').isArray().withMessage('Fields must be an array of strings'),
    check('filters').optional().isObject().withMessage('Filters must be an object'),
    check('groupBy').optional().isString().withMessage('GroupBy must be a string'),
    check('sortBy').optional().isString().withMessage('SortBy must be a string'),
    check('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('SortOrder must be either ASC or DESC'),
    check('chartType').optional().isIn(['bar', 'pie']).withMessage('ChartType must be either bar or pie'),
    check('startDate').optional().isISO8601().withMessage('Start date must be a valid date-time'),
    check('endDate').optional().isISO8601().withMessage('End date must be a valid date-time'),
  ],
  validateRequest,
  generateUniversalReport
);

export { router as reportRouter };
