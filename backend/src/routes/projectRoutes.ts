import { Router } from 'express'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  inviteUser,
  getProjectUsers,
  addUserToProject,
  removeUserFromProject,
  getProject
} from '../controllers/projectController'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'

const router = Router()

router.get('/', authenticateAll, getProjects)
router.post('/', authenticateAll, createProject)
router.get('/:projectId', authenticateAll, isProjectCreator, getProject)
router.put('/:projectId', authenticateAll, isProjectCreator, updateProject)
router.delete('/:projectId', authenticateAll, isProjectCreator, deleteProject)
router.post('/invite', authenticateAll, isProjectCreator, inviteUser)
router.get('/:projectId/users', authenticateAll, getProjectUsers)
router.post('/users', authenticateAll, isProjectCreator, addUserToProject)
router.delete('/:projectId/users/:userId', authenticateAll, isProjectCreator, removeUserFromProject)


export { router as projectRouter }
