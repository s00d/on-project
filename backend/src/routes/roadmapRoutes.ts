import { Router } from 'express';
import { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } from '../controllers/roadmapController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:projectId', authenticateAll, getRoadmaps);
router.post('/', authenticateAll, createRoadmap);
router.put('/:id', authenticateAll, updateRoadmap);
router.delete('/:id', authenticateAll, deleteRoadmap);

export { router as roadmapRouter };
