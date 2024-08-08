import { Router } from 'express'
import {
  getRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap
} from '../controllers/roadmapController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:projectId', authenticateAll, getRoadmaps)
router.post('/:projectId', authenticateAll, createRoadmap)
router.put('/:projectId/:id', authenticateAll, updateRoadmap)
router.delete('/:projectId/:id', authenticateAll, deleteRoadmap)

export { router as roadmapRouter }
