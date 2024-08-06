import { Router } from 'express';
import {
  generateReport,
  generatePriorityReport,
  generateOverdueReport,
  generateTeamPerformanceReport,
  generatePriorityDistributionReport, generateProgressReport, generateTeamWorkloadReport
} from '../controllers/reportController';
import { authenticateAll } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/project/:projectId', authenticateAll, checkRole('Developer'), generateReport);
router.get('/project/:projectId/priority', authenticateAll, checkRole('Developer'), generatePriorityReport);
router.get('/project/:projectId/overdue', authenticateAll, checkRole('Developer'), generateOverdueReport);
router.get('/project/:projectId/performance', authenticateAll, checkRole('Developer'), generateTeamPerformanceReport);
router.get('/project/:projectId/priority', authenticateAll, checkRole('Developer'), generatePriorityDistributionReport);
router.get('/project/:projectId/progress', authenticateAll, checkRole('Developer'), generateProgressReport);
router.get('/project/:projectId/workload', authenticateAll, checkRole('Developer'), generateTeamWorkloadReport);

export { router as reportRouter };
