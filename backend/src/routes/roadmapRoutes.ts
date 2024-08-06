import { Router } from 'express';
import { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap } from '../controllers/roadmapController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/:projectId', authenticateAll, checkRole('Roadmap:Read'), getRoadmaps);
router.post('/', authenticateAll, checkRole('Roadmap:Create'), createRoadmap);
router.put('/:id', authenticateAll, checkRole('Roadmap:Update'), updateRoadmap);
router.delete('/:id', authenticateAll, checkRole('Roadmap:Delete'), deleteRoadmap);

export { router as roadmapRouter };
