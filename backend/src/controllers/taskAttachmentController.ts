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
  Middlewares, Security, UploadedFile
} from 'tsoa';
import { TaskAttachment } from '../models/TaskAttachment';
import { AppDataSource } from '../ormconfig';
import { authenticateAll } from '../middlewares/authMiddleware';
import { check } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest';
import { Request as ExpressRequest } from 'express';
import path from "path";
import fs from "fs";

// Define interfaces for request body validation
interface AddTaskAttachmentRequest {
  file: Express.Multer.File;
}

@Route('api/task-attachments')
@Tags('Task Attachments')
@Security('session')
@Security('apiKey')
export class TaskAttachmentController extends Controller {
  private readonly attachmentRepository = AppDataSource.getRepository(TaskAttachment);

  /**
   * Get all attachments for a task
   * @param taskId ID of the task
   */
  @Get('{taskId}/attachments')
  @Middlewares([
    authenticateAll
  ])
  public async getTaskAttachments(
    @Path() taskId: number
  ): Promise<TaskAttachment[]> {
    try {
      return this.attachmentRepository.find({
        where: { task: { id: taskId } }
      });
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error getting task attachments: ${err.message}`);
    }
  }

  /**
   * Add an attachment to a task
   * @param taskId ID of the task
   * @param request The attachment request containing the file
   */
  @Post('{taskId}/attachments')
  @Middlewares([
    authenticateAll
  ])
  @SuccessResponse(201, 'Attachment added')
  public async addTaskAttachment(
    @UploadedFile() attachment: Express.Multer.File,
    @Path() taskId: number,
    @Request() request: ExpressRequest,
  ): Promise<TaskAttachment> {
    if (!attachment) {
      this.setStatus(400);
      throw new Error('File not provided');
    }

    const uploadDir = path.join(__dirname, '../../uploads');
    const filename = `${Date.now()}_${attachment.originalname}`;
    const filepath = path.join(uploadDir, filename);

    try {
      fs.renameSync(attachment.path, filepath);
    } catch (uploadError) {
      throw new Error('File upload failed');
    }

    try {
      const attachment = this.attachmentRepository.create({
        task: { id: taskId },
        filename: filename,
        filePath: filepath
      });
      await this.attachmentRepository.save(attachment);
      return attachment;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error adding task attachment: ${err.message}`);
    }
  }

  /**
   * Delete an attachment by ID
   * @param id ID of the attachment
   */
  @Delete('attachments/{id}')
  @Middlewares([
    authenticateAll,
    check('id').isInt().withMessage('Attachment ID must be an integer'),
    validateRequest
  ])
  @SuccessResponse(204, 'Attachment deleted')
  public async deleteTaskAttachment(
    @Path() id: number
  ): Promise<void> {
    try {
      const attachment = await this.attachmentRepository.findOne({ where: { id } });
      if (attachment) {
        await this.attachmentRepository.remove(attachment);
      } else {
        this.setStatus(404);
        throw new Error('Attachment not found');
      }
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error deleting task attachment: ${err.message}`);
    }
  }
}
