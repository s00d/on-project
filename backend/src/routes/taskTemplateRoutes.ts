import { Router } from 'express';
import { getTemplates, createTemplate, deleteTemplate } from '../controllers/taskTemplateController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateAll, getTemplates);
router.post('/', authenticateAll, createTemplate);
router.delete('/:id', authenticateAll, deleteTemplate);


export { router as taskTemplateRouter };
