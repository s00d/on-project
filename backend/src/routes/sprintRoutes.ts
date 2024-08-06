import { Router } from 'express';
import { getSprints, createSprint, updateSprint, deleteSprint } from '../controllers/sprintController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/:roadmapId', authenticateAll, checkRole('Sprint:Read'), getSprints);
router.post('/', authenticateAll, checkRole('Sprint:Create'), createSprint);
router.put('/:id', authenticateAll, checkRole('Sprint:Update'), updateSprint);
router.delete('/:id', authenticateAll, checkRole('Sprint:Delete'), deleteSprint);

export { router as sprintRouter };
