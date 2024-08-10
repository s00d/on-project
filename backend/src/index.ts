import 'reflect-metadata';

import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connect_sqlite3 from 'connect-sqlite3'
import morgan from 'morgan'
import { errorReporter } from 'express-youch'
import swaggerUi from "swagger-ui-express";
import { createProxyMiddleware } from 'http-proxy-middleware'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { userRouter } from './routes/userRoutes'
import { projectRouter } from './routes/projectRoutes'
import { taskRouter } from './routes/taskRoutes'
import { labelRouter } from './routes/labelRoutes'
import { commentRouter } from './routes/commentRoutes'
import { roadmapRouter } from './routes/roadmapRoutes'
import { sprintRouter } from './routes/sprintRoutes'
import { notificationRouter } from './routes/notificationRoutes'
import { reportRouter } from './routes/reportRoutes'
import { taskHistoryRouter } from './routes/taskHistoryRoutes'
import { taskAttachmentRouter } from './routes/taskAttachmentRoutes'
import { taskTemplateRouter } from './routes/taskTemplateRoutes'
import { importExportRouter } from './routes/importExportRoutes'
import dotenv from 'dotenv'
import path from 'path'
import { AppDataSource } from './ormconfig';
import {User} from "./models/User";
import {createUser} from "./controllers/userController";
import {Project} from "./models/Project";
import {swaggerSpec} from "./swagger";

const isDev = process.env.NODE_ENV === 'development'

declare module 'express-session' {
  interface SessionData {
    user: User
    project: Project
  }
}

dotenv.config({ path: '../.env' })

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
})

const SQLiteStore = connect_sqlite3(session)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    store: new SQLiteStore({
      db: (process.env.DATABASE_STORAGE || 'data/database.db').replace('./', '')
    }) as any,
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: (process.env.SESSION_SECURE || 'false') === 'true' } // Используйте secure: true в production с HTTPS
  })
)

app.use(morgan('combined'))
app.use(errorReporter())

app.use('/api/users', userRouter)
app.use('/api/projects', projectRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/labels', labelRouter)
app.use('/api/comments', commentRouter)
app.use('/api/roadmaps', roadmapRouter)
app.use('/api/sprints', sprintRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/reports', reportRouter)
app.use('/api/task-history', taskHistoryRouter)
app.use('/api/task-attachments', taskAttachmentRouter)
app.use('/api/task-templates', taskTemplateRouter)
app.use('/api/import-export', importExportRouter)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (isDev) {
  // frontend proxy
  app.use(
    '/*',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true
    })
  )
}

io.on('connection', (socket) => {
  console.log('a user connected to socket')
  socket.on('disconnect', () => {
    console.log('user disconnected from socket')
  })
})

app.set('io', io)

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');

    const adminUsername = process.env.DEFAULT_ADMIN ?? 'admin';
    const adminUser = await AppDataSource.getRepository(User).findOneBy({ username: adminUsername });
    if (!adminUser) {
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.ru';
      const pass = process.env.DEFAULT_ADMIN_EMAIL || 'password';
      await createUser(adminUsername, email, pass)
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    const PORT = parseInt(process.env.PORT || '3000');
    const HOST = process.env.HOST || 'localhost';

    server.listen(PORT, HOST, () => {
      console.log(`Server is running on port http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

export { io }
