import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject, inviteUser, getProjectUsers, addUserToProject, removeUserFromProject } from '../controllers/projectController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole, isProjectCreator} from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', authenticateAll, checkRole('Project:Read'), getProjects);
router.post('/', authenticateAll, checkRole('Project:Create'), createProject);
router.put('/:id', authenticateAll, isProjectCreator, checkRole('Project:Update'), updateProject);
router.delete('/:id', authenticateAll, isProjectCreator, checkRole('Project:Delete'), deleteProject);
router.post('/invite', authenticateAll, isProjectCreator, checkRole('Project:Invite'), inviteUser);
router.get('/:projectId/users', authenticateAll, checkRole('Project:ReadUsers'), getProjectUsers);
router.post('/users', authenticateAll, isProjectCreator, checkRole('Project:AddUser'), addUserToProject);
router.delete('/:projectId/users/:userId', authenticateAll, isProjectCreator, checkRole('Project:RemoveUser'), removeUserFromProject);

export { router as projectRouter };
