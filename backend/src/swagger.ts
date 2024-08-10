import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'On Project API',
      version: '1.0.0',
      description: 'This is a simple API application'
    },
    servers: [
      {
        url: 'http://localhost:3055/api'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT authorization using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies.'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API Key authentication. Example: "Authorization: ApiKey {token}"'
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        sessionAuth: [],
        apiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes/**/*.ts', './src/models/**/*.ts']
}

const swaggerSpec = swaggerJSDoc(options)

export { swaggerSpec }
