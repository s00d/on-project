import { Router } from 'express';
import { getTaskHistory } from '../controllers/taskHistoryController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:taskId/history', authenticateAll, getTaskHistory);

export { router as taskHistoryRouter };
