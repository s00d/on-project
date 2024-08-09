import { Router } from 'express'
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint
} from '../controllers/sprintController'
import { authenticateAll } from '../middlewares/authMiddleware'
import {isProjectCreator} from "../middlewares/roleMiddleware";

const router = Router()

router.get('/:projectId/:roadmapId', authenticateAll, getSprints)
router.post('/:projectId/', authenticateAll, isProjectCreator, createSprint)
router.put('/:projectId/:id', authenticateAll, isProjectCreator, updateSprint)
router.delete('/:projectId/:id', authenticateAll, isProjectCreator, deleteSprint)

export { router as sprintRouter }
