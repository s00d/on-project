import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateAll, getTasks);
router.post('/', authenticateAll, createTask);
router.put('/:id', authenticateAll, updateTask);
router.delete('/:id', authenticateAll, deleteTask);


export { router as taskRouter };
