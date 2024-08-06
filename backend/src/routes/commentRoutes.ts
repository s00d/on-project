import { Router } from 'express'
import {
  getComments,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/commentController'
import { authenticateAll } from '../middlewares/authMiddleware'

const router = Router()

router.get('/:taskId', authenticateAll, getComments)
router.post('/:id', authenticateAll, addComment)
router.put('/:id', authenticateAll, updateComment)
router.delete('/:id', authenticateAll, deleteComment)

export { router as commentRouter }
