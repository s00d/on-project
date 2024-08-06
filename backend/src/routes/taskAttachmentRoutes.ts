import { Router } from 'express';
import { getTaskAttachments, addTaskAttachment, deleteTaskAttachment, } from '../controllers/taskAttachmentController';
import { authenticateAll } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:taskId/attachments', authenticateAll, getTaskAttachments);
router.post('/:taskId/attachments', authenticateAll, addTaskAttachment);
router.delete('/attachments/:id', authenticateAll, deleteTaskAttachment);

export { router as taskAttachmentRouter };
