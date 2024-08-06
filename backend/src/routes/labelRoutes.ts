import { Router } from 'express';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/', authenticateAll, checkRole('Label:Read'), getLabels);
router.post('/', authenticateAll, checkRole('Label:Create'), createLabel);
router.put('/:id', authenticateAll, checkRole('Label:Update'), updateLabel);
router.delete('/:id', authenticateAll, checkRole('Label:Delete'), deleteLabel);

export { router as labelRouter };
