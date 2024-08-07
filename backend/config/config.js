require('dotenv').config();

module.exports = {
  development: {
    dialect: process.env.DATABASE_DIALECT || 'sqlite',
    storage: process.env.DATABASE_STORAGE || './data/database.db',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'your_database_name',
    username: process.env.DATABASE_USERNAME || 'your_database_user',
    password: process.env.DATABASE_PASSWORD || 'your_database_password'
  },
  test: {
    dialect: process.env.DATABASE_DIALECT || 'sqlite',
    storage: process.env.DATABASE_STORAGE || './data/database.db',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'your_database_name',
    username: process.env.DATABASE_USERNAME || 'your_database_user',
    password: process.env.DATABASE_PASSWORD || 'your_database_password'
  },
  production: {
    dialect: process.env.DATABASE_DIALECT || 'sqlite',
    storage: process.env.DATABASE_STORAGE || './data/database.db',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'your_database_name',
    username: process.env.DATABASE_USERNAME || 'your_database_user',
    password: process.env.DATABASE_PASSWORD || 'your_database_password'
  }
};
