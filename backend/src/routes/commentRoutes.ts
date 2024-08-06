import { Router } from 'express';
import { getComments, addComment, updateComment, deleteComment, upload } from '../controllers/commentController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/:taskId', authenticateAll, checkRole('Comment:Read'), getComments);
router.post('/', authenticateAll, checkRole('Comment:Create'), upload.single('attachment'), addComment);
router.put('/:id', authenticateAll, checkRole('Comment:Update'), updateComment);
router.delete('/:id', authenticateAll, checkRole('Comment:Delete'), deleteComment);

export { router as commentRouter };
