import { DataSource } from 'typeorm'
import dotenv from 'dotenv'


dotenv.config({ path: '../.env' })

export const AppDataSource = new DataSource({
  type: (process.env.DATABASE_DIALECT || 'sqlite') as 'mysql' | 'mariadb' | 'sqlite' | 'postgres',
  database: process.env.DATABASE_STORAGE || 'data/database.db',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,

  synchronize: true, // For development only, set to false in production
  logging: (process.env.DATABASE_LOGGING ?? 'true') === 'true',
  entities: ['src/models/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: []
})
