import { Router } from 'express'
import { getNotifications, markAsRead } from '../controllers/notificationController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', authenticateAll, getNotifications)
router.put('/:id/read', authenticateAll, markAsRead)

export { router as notificationRouter }
