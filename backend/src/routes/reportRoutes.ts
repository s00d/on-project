import { Router } from 'express'
import {
  generateReport,
  generatePriorityReport,
  generateOverdueReport,
  generateTeamPerformanceReport,
  generatePriorityDistributionReport,
  generateProgressReport,
  generateTeamWorkloadReport
} from '../controllers/reportController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/project/:projectId', authenticateAll, generateReport)
router.get('/project/:projectId/priority_distribution', authenticateAll, generatePriorityDistributionReport)
router.get('/project/:projectId/overdue', authenticateAll, generateOverdueReport)
router.get('/project/:projectId/performance', authenticateAll, generateTeamPerformanceReport)
router.get('/project/:projectId/priority', authenticateAll, generatePriorityReport)
router.get('/project/:projectId/progress', authenticateAll, generateProgressReport)
router.get('/project/:projectId/workload', authenticateAll, generateTeamWorkloadReport)

export { router as reportRouter }
