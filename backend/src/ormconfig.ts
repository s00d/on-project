import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import path from "path";

process.chdir(path.dirname(__filename));

dotenv.config({ path: '../.env' })

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_DIALECT || 'sqlite') as 'mysql' | 'mariadb' | 'sqlite' | 'postgres',
  database: '../data/' + (process.env.DATABASE_STORAGE || 'database.db'),
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,

  synchronize: true, // For development only, set to false in production
  logging: (process.env.DATABASE_LOGGING ?? 'true') === 'true',
  entities: [isProduction ? 'models/*.js' : 'models/*.ts'],
  migrations: [isProduction ? 'migrations/*.js' : 'migrations/*.ts'],
  subscribers: []
})
