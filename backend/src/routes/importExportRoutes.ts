import { Router } from 'express'
import multer from 'multer'
import { importData, exportData, importFromGitHub } from '../controllers/importExportController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()
const upload = multer({ dest: 'uploads/' })

router.post('/import', authenticateAll, importData)
router.get('/export', authenticateAll, exportData)
router.post('/github-import', authenticateAll, importFromGitHub)

export { router as importExportRouter }
