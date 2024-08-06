import { Router } from 'express';
import { getTaskHistory } from '../controllers/taskHistoryController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/:taskId/history', authenticateAll, checkRole('TaskHistory:Read'), getTaskHistory);

export { router as taskHistoryRouter };
