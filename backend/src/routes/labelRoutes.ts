import { Router } from 'express'
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', authenticateAll, getLabels)
router.post('/', authenticateAll, createLabel)
router.put('/:id', authenticateAll, updateLabel)
router.delete('/:id', authenticateAll, deleteLabel)

export { router as labelRouter }
