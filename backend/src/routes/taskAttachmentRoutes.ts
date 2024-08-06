import { Router } from 'express';
import { getTaskAttachments, addTaskAttachment, deleteTaskAttachment, upload } from '../controllers/taskAttachmentController';
import { authenticateAll } from '../middlewares/authMiddleware';
import {checkRole} from "../middlewares/roleMiddleware";

const router = Router();

router.get('/:taskId/attachments', authenticateAll, checkRole('TaskAttachment:Read'), getTaskAttachments);
router.post('/:taskId/attachments', authenticateAll, checkRole('TaskAttachment:Create'), upload.single('file'), addTaskAttachment);
router.delete('/attachments/:id', authenticateAll, checkRole('TaskAttachment:Delete'), deleteTaskAttachment);

export { router as taskAttachmentRouter };
