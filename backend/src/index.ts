import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import connect_sqlite3 from 'connect-sqlite3';
import morgan from 'morgan';
import { errorReporter } from 'express-youch';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { RegisterRoutes } from './routes/routes';
import { AppDataSource } from './ormconfig';
import { User } from './models/User';
import { Project } from './models/Project';
import { Response as ExResponse, Request as ExRequest } from "express";
import {createUser} from "./controllers/userController";
import {errorHandler} from "./middlewares/errorHandler";

dotenv.config({ path: '../.env' });

const isDev = process.env.NODE_ENV === 'development';

// Extend the Express session
declare module 'express-session' {
  interface SessionData {
    user?: User|null;
    project?: Project|null;
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const SQLiteStore = connect_sqlite3(session);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    store: new SQLiteStore({
      db: (process.env.DATABASE_STORAGE || 'data/database.db').replace('./', ''),
    }) as any,
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: (process.env.SESSION_SECURE || 'false') === 'true' },
  })
);

app.use(morgan('combined'));
app.use(errorReporter());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import("../dist/swagger.json"))
  );
});

// Register tsoa routes
RegisterRoutes(app);

app.use(errorHandler);

if (isDev) {
  // frontend proxy
  app.use(
    '/*',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
    })
  );
}

io.on('connection', (socket) => {
  console.log('a user connected to socket');
  socket.on('disconnect', () => {
    console.log('user disconnected from socket');
  });
});

app.set('io', io);

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');

    const adminUsername = process.env.DEFAULT_ADMIN ?? 'admin';
    const adminUser = await AppDataSource.getRepository(User).findOneBy({ username: adminUsername });
    if (!adminUser) {
      const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.ru';
      const pass = process.env.DEFAULT_ADMIN_EMAIL || 'password';
      await createUser(adminUsername, email, pass);
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

process.on('SIGINT', () => {
  console.log('Caught interrupt signal');
  process.exit();
});

export { io };
