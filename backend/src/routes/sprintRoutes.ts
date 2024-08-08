import { Router } from 'express'
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint
} from '../controllers/sprintController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:projectId/:roadmapId', authenticateAll, getSprints)
router.post('/:projectId/', authenticateAll, createSprint)
router.put('/:projectId/:id', authenticateAll, updateSprint)
router.delete('/:projectId/:id', authenticateAll, deleteSprint)

export { router as sprintRouter }
