import { Router } from 'express'
import {
  getRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap
} from '../controllers/roadmapController'
import { authenticateAll } from '../middlewares/authMiddleware'
import {isProjectCreator} from "../middlewares/roleMiddleware";

const router = Router()

router.get('/:projectId', authenticateAll, getRoadmaps)
router.post('/:projectId', authenticateAll, isProjectCreator, createRoadmap)
router.put('/:projectId/:id', authenticateAll, isProjectCreator, updateRoadmap)
router.delete('/:projectId/:id', authenticateAll, isProjectCreator, deleteRoadmap)

export { router as roadmapRouter }
