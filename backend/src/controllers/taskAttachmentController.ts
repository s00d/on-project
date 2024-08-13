import {
  Controller,
  Get,
  Post,
  Delete,
  Path,
  SuccessResponse,
  Route,
  Tags,
  Request,
  Middlewares,
  Security,
  UploadedFile
} from 'tsoa'
import { TaskAttachment } from '../models/TaskAttachment'
import { AppDataSource } from '../ormconfig'
import { authenticateAll } from '../middlewares/authMiddleware'
import path from 'path'
import { isProjectCreator } from '../middlewares/roleMiddleware'
import {deleteFile, handleFileUpload} from "./fileController";

@Route('api/task-attachments')
@Tags('Task Attachments')
@Security('session')
@Security('apiKey')
export class TaskAttachmentController extends Controller {
  private readonly attachmentRepository = AppDataSource.getRepository(TaskAttachment)

  /**
   * Get all attachments for a task
   * @param taskId ID of the task
   */
  @Get('{projectId}/{taskId}/attachments')
  @Middlewares([authenticateAll])
  public async getTaskAttachments(@Path() taskId: number): Promise<TaskAttachment[]> {
    try {
      return this.attachmentRepository.find({
        where: { task: { id: taskId } }
      })
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(`Error getting task attachments: ${err.message}`)
    }
  }

  /**
   * Add an attachment to a task
   * @param projectId
   * @param attachment
   * @param taskId ID of the task
   */
  @Post('{projectId}/{taskId}/attachments')
  @Middlewares([authenticateAll])
  @SuccessResponse(201, 'Attachment added')
  public async addTaskAttachment(
    @Path() projectId: number,
    @UploadedFile() attachment: Express.Multer.File,
    @Path() taskId: number,
  ): Promise<TaskAttachment> {
    if (!attachment) {
      this.setStatus(400)
      throw new Error('File not provided')
    }

    const uploadResult = await handleFileUpload(attachment, 'uploads', projectId, 'task', taskId);

    try {
      const attachment = this.attachmentRepository.create({
        task: { id: taskId },
        filename: uploadResult.filename,
        filePath: uploadResult.fillPath
      });
      await this.attachmentRepository.save(attachment);
      return attachment;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error adding task attachment`);
    }
  }

  /**
   * Delete an attachment by ID
   * @param id ID of the attachment
   */
  @Delete('{projectId}/attachments/{id}')
  @Middlewares([authenticateAll, isProjectCreator])
  @SuccessResponse(204, 'Attachment deleted')
  public async deleteTaskAttachment(@Path() id: number): Promise<void> {
    try {
      const attachment = await this.attachmentRepository.findOne({ where: { id } })
      if (attachment) {
        await this.attachmentRepository.remove(attachment)

        if (attachment.filePath) {
          await deleteFile(path.join(__dirname, '../../', attachment.filePath));
        }
      } else {
        this.setStatus(404)
        throw new Error('Attachment not found')
      }
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(`Error deleting task attachment: ${err.message}`)
    }
  }
}
