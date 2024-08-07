import { Router } from 'express'
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:projectId/', authenticateAll, getLabels)
router.post('/:projectId/', authenticateAll, createLabel)
router.put('/:projectId/:id', authenticateAll, updateLabel)
router.delete('/:projectId/:id', authenticateAll, deleteLabel)

export { router as labelRouter }
