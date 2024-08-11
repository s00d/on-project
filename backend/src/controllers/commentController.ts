import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Body,
  SuccessResponse,
  UploadedFile,
  FormField,
  Middlewares, Security
} from 'tsoa';
import { Comment } from '../models/Comment';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { AppDataSource } from '../ormconfig';
import { io } from '../index';
import fs from 'fs';
import path from 'path';
import { authenticateAll } from "../middlewares/authMiddleware";
import {isProjectCreator} from "../middlewares/roleMiddleware";

@Route('api/comments')
@Tags('Comments')
@Security('session')
@Security('apiKey')
export class CommentController extends Controller {

  @Get('{taskId}')
  @Middlewares([
    authenticateAll
  ])
  public async getComments(@Path() taskId: number): Promise<Comment[]> {
    const commentRepository = AppDataSource.getRepository(Comment);
    return await commentRepository.find({
      where: { task: { id: taskId } },
      relations: ['user']
    });
  }

  @Post('{taskId}')
  @Middlewares([
    authenticateAll
  ])
  public async addComment(
    @Path() taskId: number,
    @UploadedFile() attachment: Express.Multer.File,
    @FormField() content: string,
    @FormField() userId: number,
  ): Promise<Comment> {
    let savedFilename: string | null = null;

    if (attachment) {
      const uploadDir = path.join(__dirname, '../../uploads');
      const filename = `${Date.now()}_${attachment.originalname}`;
      const filepath = path.join(uploadDir, filename);

      try {
        fs.renameSync(attachment.path, filepath);
        savedFilename = filename;
      } catch (uploadError) {
        throw new Error('File upload failed');
      }
    }

    try {
      const commentRepository = AppDataSource.getRepository(Comment);
      const userRepository = AppDataSource.getRepository(User);
      const taskRepository = AppDataSource.getRepository(Task);

      const user = await userRepository.findOneBy({ id: userId });
      const task = await taskRepository.findOneBy({ id: taskId });

      if (!user) throw new Error('User not found');
      if (!task) throw new Error('Task not found');

      const comment = commentRepository.create({
        content,
        task,
        user,
        attachment: savedFilename
      });

      await commentRepository.save(comment);
      io.emit('comment:create', comment);

      return comment;
    } catch (error: any) {
      throw new Error(`Error creating comment: ${error.message}`);
    }
  }

  @Put('{id}')
  @SuccessResponse('200', 'Comment updated successfully')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async updateComment(@Path() id: number, @Body() body: { content: string }): Promise<Comment> {
    const { content } = body;
    const commentRepository = AppDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id } });

    if (!comment) throw { status: 404, message: 'Comment not found' };

    comment.content = content;
    await commentRepository.save(comment);
    io.emit('comment:update', comment);

    return comment;
  }

  @Delete('{id}')
  @SuccessResponse('204', 'Comment deleted successfully')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async deleteComment(@Path() id: number): Promise<void> {
    const commentRepository = AppDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id } });

    if (!comment) throw { status: 404, message: 'Comment not found' };

    if (comment.attachment) {
      fs.unlinkSync(path.join(__dirname, '../../uploads', comment.attachment));
    }

    await commentRepository.remove(comment);
    io.emit('comment:delete', { id });
  }
}
