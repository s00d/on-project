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
import { Request as ExpressRequest } from 'express';
import path from "path";
import fs from "fs";
import {isProjectCreator} from "../middlewares/roleMiddleware";


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
   * @param attachment
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
    let savedFilename: string | null = null;

    if (attachment) {
      const uploadDir = path.join(__dirname, '../../uploads');
      const filename = `${Date.now()}_${attachment.originalname}`;
      const folderPath = path.join(uploadDir, taskId.toString());
      const filepath = path.join(folderPath, filename);

      if (!fs.existsSync(folderPath)) {
        try {
          fs.mkdirSync(folderPath, {recursive: true});
        } catch (err: any) {
          throw new Error('Failed to create directory');
        }
      }

      try {
        fs.writeFileSync(filepath, attachment.buffer);
        savedFilename = path.join(taskId.toString(), filename);
      } catch (uploadError) {
        throw new Error('File upload failed');
      }

      try {
        const attachment = this.attachmentRepository.create({
          task: { id: taskId },
          filename: savedFilename!,
          filePath: savedFilename!
        });
        await this.attachmentRepository.save(attachment);
        return attachment;
      } catch (err: any) {
        this.setStatus(400);
        throw new Error(`Error adding task attachment}`);
      }
    }
    throw new Error(`Error adding task attachment.`);

  }

  /**
   * Delete an attachment by ID
   * @param id ID of the attachment
   */
  @Delete('attachments/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
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
