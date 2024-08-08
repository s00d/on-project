import { Router } from 'express'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  inviteUser,
  getProjectUsers,
  getProject, DeActiveUser
} from '../controllers/projectController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'

const router = Router()

router.get('/', authenticateAll, getProjects)
router.post('/', authenticateAll, createProject)
router.get('/:projectId', authenticateAll, getProject)
router.put('/:projectId', authenticateAll, isProjectCreator, updateProject)
router.delete('/:projectId', authenticateAll, isProjectCreator, deleteProject)
router.post('/:projectId/invite', authenticateAll, isProjectCreator, inviteUser)
router.get('/:projectId/users', authenticateAll, getProjectUsers)
router.post('/:projectId/users', authenticateAll, isProjectCreator)
router.delete('/:projectId/users/:userId', authenticateAll, isProjectCreator, DeActiveUser)


export { router as projectRouter }
