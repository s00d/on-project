import express from 'express';
import bodyParser from 'body-parser';
import session from "express-session";
import connect_sqlite3 from "connect-sqlite3";
import morgan from "morgan";
import { errorReporter } from "express-youch";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sequelize } from './sequelize';
import { userRouter } from './routes/userRoutes';
import { projectRouter } from './routes/projectRoutes';
import { taskRouter } from './routes/taskRoutes';
import { labelRouter } from './routes/labelRoutes';
import { commentRouter } from './routes/commentRoutes';
import { roadmapRouter } from './routes/roadmapRoutes';
import { sprintRouter } from './routes/sprintRoutes';
import { roleRouter } from './routes/roleRoutes';
import { notificationRouter } from './routes/notificationRoutes';
import { reportRouter } from './routes/reportRoutes';
import { taskHistoryRouter } from './routes/taskHistoryRoutes';
import { taskAttachmentRouter } from './routes/taskAttachmentRoutes';
import { taskTemplateRouter } from './routes/taskTemplateRoutes';
import { importExportRouter } from './routes/importExportRoutes';
import dotenv from 'dotenv';
import path from "path";
import {createDefaultRoles} from "./models/Role";
import type { User } from "./models";

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const SQLiteStore = connect_sqlite3(session);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  store: (new SQLiteStore({
    db: (process.env.DATABASE_STORAGE || 'data/database.db').replace('./', ''),
  })) as any,
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: (process.env.SESSION_SECURE || 'false') === 'true' } // Используйте secure: true в production с HTTPS
}));

app.use(morgan('combined'))
app.use(errorReporter());

app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/labels', labelRouter);
app.use('/api/comments', commentRouter);
app.use('/api/roadmaps', roadmapRouter);
app.use('/api/sprints', sprintRouter);
app.use('/api/roles', roleRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reports', reportRouter);
app.use('/api/task-history', taskHistoryRouter);
app.use('/api/task-attachments', taskAttachmentRouter);
app.use('/api/task-templates', taskTemplateRouter);
app.use('/api/import-export', importExportRouter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// frontend proxy
app.use(
  '/*',
  createProxyMiddleware({
    target: 'http://localhost:4577',
    changeOrigin: true
  })
);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.set('io', io);

sequelize.sync().then(async () => {
  await createDefaultRoles()

  const PORT = parseInt(process.env.PORT || '3000');
  const HOST = process.env.HOST || 'localhost';

  server.listen(PORT, HOST, () => {
    console.log(`Server is running on port http://${HOST}:${PORT}`);
  });
});

export { io };
