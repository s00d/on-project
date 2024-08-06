import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', authenticateAll, checkRole('Task:Read'), getTasks);
router.post('/', authenticateAll, checkRole('Task:Create'), createTask);
router.put('/:id', authenticateAll, checkRole('Task:Update'), updateTask);
router.delete('/:id', authenticateAll, checkRole('Task:Delete'), deleteTask);


export { router as taskRouter };
