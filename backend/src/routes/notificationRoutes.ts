import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/', authenticateAll, checkRole('Notification:Read'), getNotifications);
router.put('/:id/read', authenticateAll, checkRole('Notification:Update'), markAsRead);

export { router as notificationRouter };
