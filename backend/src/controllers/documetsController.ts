import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
  FormField,
  UploadedFile, Res, TsoaResponse
} from 'tsoa';
import { AppDataSource } from '../ormconfig';
import { Document } from '../models/Document';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { authenticateAll } from '../middlewares/authMiddleware';
import { Request as ExpressRequest } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface DocumentDTO {
  title: string,
  description?: string,
  filePath?: string,
  projectId: number,
  userId: number
}

@Route('api/documents')
@Tags('Documents')
@Security('session')
@Security('apiKey')
export class DocumentController extends Controller {
  private readonly documentRepository = AppDataSource.getRepository(Document);

  @Get('{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'List of documents')
  @Middlewares([authenticateAll])
  public async getDocuments(
    @Path() projectId: number
  ): Promise<Document[]> {
    try {
      return await this.documentRepository.find({ where: { project: { id: projectId } } });
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Get('{projectId}/{id}')
  @Response(404, 'Document not found')
  @SuccessResponse(200, 'Document details')
  @Middlewares([authenticateAll])
  public async getDocument(
    @Path() projectId: number,
    @Path() id: number
  ): Promise<Document> {
    try {
      const document = await this.documentRepository.findOne({ where: { project: { id: projectId }, id } });
      if (!document) {
        this.setStatus(404);
        throw new Error('Document not found');
      }
      return document;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Post('{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(201, 'Document created successfully')
  @Middlewares([authenticateAll])
  public async createDocument(
    @Path() projectId: number,
    @FormField() title: string,
    @FormField() description: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest
  ): Promise<Document> {
    const userId = req.session!.user!.id;
    let savedFilename: string | null = null;

    if (file) {
      const uploadDir = path.join(__dirname, '../../documents');
      const filename = `${Date.now()}_${file.originalname}`;
      const folderPath = path.join(uploadDir, projectId.toString());
      const filepath = path.join(folderPath, filename);

      if (!fs.existsSync(folderPath)) {
        try {
          fs.mkdirSync(folderPath, { recursive: true });
        } catch (err: any) {
          throw new Error('Failed to create directory');
        }
      }

      try {
        fs.writeFileSync(filepath, file.buffer);
        savedFilename = path.join("/api/documents/", projectId.toString(), '/download/', filename);
      } catch (uploadError) {
        throw new Error('File upload failed');
      }
    }

    try {
      const projectRepository = AppDataSource.getRepository(Project);
      const userRepository = AppDataSource.getRepository(User);

      const project = await projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.setStatus(404);
        throw new Error('User not found');
      }

      const newDocument = this.documentRepository.create({
        title,
        description: description || "", // Убедитесь, что передаете строку, даже если описание пустое
        filePath: savedFilename || "", // Убедитесь, что путь к файлу - это строка
        project,
        user,
      } as Partial<Document>); // Явно указываем тип как Partial<Document>

      await this.documentRepository.save(newDocument);

      return newDocument;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Put('{projectId}/{id}')
  @Response(400, 'Bad request')
  @Response(404, 'Document not found')
  @SuccessResponse(200, 'Document updated successfully')
  @Middlewares([authenticateAll])
  public async updateDocument(
    @Path() projectId: number,
    @Path() id: number,
    @FormField() title: string,
    @FormField() description: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest
  ): Promise<Document> {
    const userId = req.session.user!.id;
    let savedFilename: string | null = null;

    if (!userId) {
      this.setStatus(401);
      throw new Error('User not authenticated');
    }

    if (file) {
      const uploadDir = path.join(__dirname, '../../documents');
      const filename = `${Date.now()}_${file.originalname}`;
      const folderPath = path.join(uploadDir, projectId.toString());
      const filepath = path.join(folderPath, filename);

      if (!fs.existsSync(folderPath)) {
        try {
          fs.mkdirSync(folderPath, { recursive: true });
        } catch (err: any) {
          throw new Error('Failed to create directory');
        }
      }

      try {
        fs.writeFileSync(filepath, file.buffer);
        savedFilename = path.join("/api/documents/", projectId.toString(), '/download/', filename);
      } catch (uploadError) {
        throw new Error('File upload failed');
      }
    }

    try {
      const document = await this.documentRepository.findOne({ where: { id, project: { id: projectId } } });
      if (!document) {
        this.setStatus(404);
        throw new Error('Document not found');
      }

      if (savedFilename) {
        document.filePath = savedFilename;
      }

      document.title = title;
      document.description = description;

      await this.documentRepository.save(document);

      return document;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Delete('{projectId}/{id}')
  @Response(404, 'Document not found')
  @SuccessResponse(200, 'Document deleted successfully')
  @Middlewares([authenticateAll])
  public async deleteDocument(
    @Path() projectId: number,
    @Path() id: number
  ): Promise<void> {
    try {
      const document = await this.documentRepository.findOne({ where: { id, project: { id: projectId } } });
      if (!document) {
        this.setStatus(404);
        return;
      }

      // Определяем путь к файлу для удаления
      const filePath = path.join(__dirname, '../../', document.filePath);

      // Удаление записи из базы данных
      await this.documentRepository.remove(document);

      // Удаление файла с файловой системы
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err: any) {
          throw new Error(`Failed to delete file: ${err.message}`);
        }
      }
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Get('{projectId}/download/{filename}')
  @Response(404, 'File not found')
  @SuccessResponse(200, 'File retrieved successfully')
  @Middlewares([authenticateAll])
  public async getFile(
    @Path() projectId: number,
    @Path() filename: string,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
    @Res() fileResponse: TsoaResponse<200, any>
  ): Promise<void> {
    const filePath = path.join(__dirname, `../../documents/${projectId}/`, filename);

    console.log(111, filePath)

    if (fs.existsSync(filePath)) {
      fileResponse(200, fs.createReadStream(filePath));
    } else {
      notFoundResponse(404, { message: 'File not found' });
    }
  }
}
