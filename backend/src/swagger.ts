import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from "dotenv";
import path from "path";

process.chdir(path.dirname(__filename));

dotenv.config({ path: '../.env' });

const isProduction = process.env.NODE_ENV === 'production';
const host = path.join(process.env.PROJECT_HOST ?? 'http://localhost:3055', '/api');

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'On-Project API Documentation',
      version: '1.0.0',
      description: 'On-Project is a comprehensive project management API designed to facilitate efficient task and project management for teams.',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: host,
        description: 'Main API server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authorization using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies.',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API Key authentication. Example: "Authorization: ApiKey {token}"',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        sessionAuth: [],
        apiKeyAuth: [],
      },
    ],
  },
  apis: [
    isProduction ? './routes/**/*.js' : './routes/**/*.ts',
    isProduction ? './models/**/*.js' : './models/**/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec };
