import { Router } from 'express'
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint
} from '../controllers/sprintController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:roadmapId', authenticateAll, getSprints)
router.post('/', authenticateAll, createSprint)
router.put('/:id', authenticateAll, updateSprint)
router.delete('/:id', authenticateAll, deleteSprint)

export { router as sprintRouter }
