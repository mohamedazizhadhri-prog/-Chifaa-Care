import swaggerJsdoc from 'swagger-jsdoc';

const version = '1.0.0'; // Direct version instead of importing from package.json

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChifaaCare API Documentation',
      version,
      description: 'API documentation for ChifaaCare healthcare platform',
      contact: {
        name: 'ChifaaCare Support',
        email: 'support@chifaacare.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/types/*.ts'],
};

const specs = swaggerJsdoc(options);

export default specs;
