import { Router } from 'express';
import { getRoles, createRole, assignRole, getPermissions, createPermission } from '../controllers/roleController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { checkRole, isProjectCreator } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', authenticateAll, checkRole('Role:Read'), getRoles);
router.post('/', authenticateAll, checkRole('Role:Create'), createRole);
router.post('/assign', authenticateAll, isProjectCreator, checkRole('Role:Assign'), assignRole);
router.get('/:roleId/permissions', authenticateAll, checkRole('Role:ReadPermissions'), getPermissions);
router.post('/permissions', authenticateAll, checkRole('Role:CreatePermission'), createPermission);

export { router as roleRouter };
