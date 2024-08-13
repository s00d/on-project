import { Controller, Get, Path, Res, Route, Tags, TsoaResponse } from 'tsoa';
import * as fs from 'fs';
import * as path from 'path';

export interface FileUploadResult {
  filename: string;
  filepath: string;
  fillDir: string;
  fillPath: string;
}

@Route('api/files')
@Tags('Files')
export class FileController extends Controller {

  /**
   * Downloads a file by filename
   * @param filename The name of the file
   * @param notFoundResponse
   * @param fileResponse
   */
  @Get('{projectId}/download/{filename}')
  public async downloadFile(
    @Path() filename: string,
    @Res() notFoundResponse: TsoaResponse<404, { message: string }>,
    @Res() fileResponse: TsoaResponse<200, any>
  ): Promise<void> {
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (fs.existsSync(filePath)) {
      fileResponse(200, fs.createReadStream(filePath));
    } else {
      notFoundResponse(404, { message: 'File not found' });
    }
  }
}

/**
 * Handles the uploading of a file.
 * @param file The file to be uploaded.
 * @param projectId
 * @param uploadDir The directory where the file should be uploaded.
 * @param subDir Optional subdirectory inside the uploadDir.
 * @param subId
 * @returns The saved filename and filepath.
 */
export async function handleFileUpload(
  file: Express.Multer.File,
  uploadDir: string,
  projectId: number,
  subDir: string,
  subId?: number,
): Promise<FileUploadResult> {
  const filePath = subId ? path.join('/', uploadDir, projectId?.toString(), subDir, subId.toString()) : path.join('/', uploadDir, projectId?.toString(), subDir);
  const fillDir = path.join(__dirname, '../../', filePath)
  const filename = `${Date.now()}_${file.originalname}`;
  const filepath = path.join(fillDir, filename);

  if (!fs.existsSync(fillDir)) {
    try {
      fs.mkdirSync(fillDir, { recursive: true });
    } catch (err: any) {
      throw new Error('Failed to create directory');
    }
  }

  try {
    fs.writeFileSync(filepath, file.buffer);
    return { filename, filepath, fillDir, fillPath: path.join(filePath, filename) };
  } catch (uploadError) {
    throw new Error('File upload failed');
  }
}

/**
 * Deletes a file by its filepath.
 * @param filepath The path to the file to be deleted.
 * @throws Error if the file does not exist or if an error occurs during deletion.
 */
export async function deleteFile(filepath: string): Promise<void> {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }

  try {
    fs.unlinkSync(filepath);
    console.log(`File deleted: ${filepath}`);
  } catch (err: any) {
    throw new Error(`Failed to delete file: ${err.message}`);
  }
}

/**
 * Deletes a directory and all its contents.
 * @param dirPath The path to the directory to be deleted.
 * @throws Error if the directory does not exist or if an error occurs during deletion.
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Directory deleted: ${dirPath}`);
  } catch (err: any) {
    throw new Error(`Failed to delete directory: ${err.message}`);
  }
}
