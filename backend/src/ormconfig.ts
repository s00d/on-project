import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

import { User } from './models/User'
import { Project } from './models/Project'
import { Task } from './models/Task'
import { Comment } from './models/Comment'
import { Label } from './models/Label'
import { Notification } from './models/Notification'
import { ProjectUser } from './models/ProjectUser'
import { Roadmap } from './models/Roadmap'
import { Sprint } from './models/Sprint'
import { TaskHistory } from './models/TaskHistory'
import { TaskAttachment } from './models/TaskAttachment'
import { TaskTemplate } from './models/TaskTemplate'

dotenv.config({ path: '../.env' })

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_DIALECT || 'sqlite') as 'mysql' | 'mariadb' | 'sqlite' | 'postgres',
  database: process.env.DATABASE_STORAGE || 'data/database.db',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,

  synchronize: true, // For development only, set to false in production
  logging: (process.env.DATABASE_LOGGING ?? 'true') === 'true',
  entities: [
    User,
    Project,
    Task,
    Comment,
    Label,
    Notification,
    ProjectUser,
    Roadmap,
    Sprint,
    TaskHistory,
    TaskAttachment,
    TaskTemplate
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: []
})
