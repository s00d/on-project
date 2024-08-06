import { Request, Response } from 'express';
import { Comment } from '../models';
import { User } from '../models';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { io } from '../index';

// Настройка хранения файлов с использованием multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const getComments = async (req: Request, res: Response) => {
  const taskId = req.params.taskId;
  const comments = await Comment.findAll({ where: { taskId }, include: [User] });
  res.json(comments);
};

const addComment = async (req: Request, res: Response) => {
  const { content, taskId, userId } = req.body;
  const attachment = req.file ? req.file.filename : null;

  try {
    const comment = await Comment.create({ content, taskId, userId, attachment });
    io.emit('comment:create', comment);
    res.json(comment);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByPk(id);
    if (comment) {
      await comment.update({ content });
      io.emit('comment:update', comment);
      res.json(comment);
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id);
    if (comment) {
      if (comment.attachment) {
        fs.unlinkSync(path.join(__dirname, '../../uploads', comment.attachment));
      }
      await comment.destroy();
      io.emit('comment:delete', { id: Number(id) });
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getComments, addComment, updateComment, deleteComment, upload };
