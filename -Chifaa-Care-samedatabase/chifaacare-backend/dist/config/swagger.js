"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const version = '1.0.0'; // Direct version instead of importing from package.json
const options = {
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
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
