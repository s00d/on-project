import { Router } from 'express';
import multer from 'multer';
import { importData, exportData, importFromGitHub } from '../controllers/importExportController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import', authenticateAll, checkRole('ImportExport:Import'), upload.single('file'), importData);
router.get('/export', authenticateAll, checkRole('ImportExport:Export'), exportData);
router.post('/github-import', authenticateAll, checkRole('ImportExport:GitHubImport'), importFromGitHub);

export { router as importExportRouter };
