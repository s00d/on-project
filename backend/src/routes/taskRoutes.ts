import { Router } from 'express'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'

const router = Router()

router.get('/:projectId', authenticateAll, getTasks)
router.post('/:projectId', authenticateAll, createTask)
router.get('/:projectId/:id', authenticateAll, getTask)
router.put('/:projectId/:id', authenticateAll, updateTask)
router.delete('/:projectId/:id', authenticateAll, isProjectCreator, deleteTask)

export { router as taskRouter }
