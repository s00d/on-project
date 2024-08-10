import { Router } from 'express';
import { importData, exportData, importFromGitHub } from '../controllers/importExportController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

/**
 * @swagger
 * /import-export/import:
 *   post:
 *     summary: Import data from a JSON file
 *     tags: [Import/Export]
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
 *       200:
 *         description: Data imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data imported successfully
 *       400:
 *         description: No file uploaded or other errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No file uploaded
 */
router.post(
  '/import',
  authenticateAll,
  upload.single('file'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    next();
  },
  validateRequest,
  importData
);

/**
 * @swagger
 * /import-export/export:
 *   get:
 *     summary: Export data to a JSON file
 *     tags: [Import/Export]
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error exporting data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error exporting data
 */
router.get('/export', authenticateAll, exportData);

/**
 * @swagger
 * /import-export/github-import:
 *   post:
 *     summary: Import data from a GitHub repository
 *     tags: [Import/Export]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: GitHub Personal Access Token
 *               repoUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               projectId:
 *                 type: number
 *                 description: The ID of the project in your system
 *     responses:
 *       200:
 *         description: Data imported from GitHub successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data imported from GitHub successfully
 *       400:
 *         description: Error importing data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error importing data
 */
router.post(
  '/github-import',
  authenticateAll,
  [
    body('token').isString().withMessage('GitHub Personal Access Token is required'),
    body('repoUrl').isString().withMessage('GitHub repository URL is required'),
    body('projectId').isInt().withMessage('Project ID must be an integer'),
  ],
  validateRequest,
  importFromGitHub
);

export { router as importExportRouter };
