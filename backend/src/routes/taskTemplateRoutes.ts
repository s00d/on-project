import { Router } from 'express';
import { getTemplates, createTemplate, deleteTemplate } from '../controllers/taskTemplateController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/', authenticateAll, checkRole('TaskTemplate:Read'), getTemplates);
router.post('/', authenticateAll, checkRole('TaskTemplate:Create'), createTemplate);
router.delete('/:id', authenticateAll, checkRole('TaskTemplate:Delete'), deleteTemplate);


export { router as taskTemplateRouter };
