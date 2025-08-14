"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const database_1 = require("./database");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cookie parser middleware
app.use((0, cookie_parser_1.default)());
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ChifaaCare API is running',
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
    });
});
// Start server
const startServer = async () => {
    try {
        // Test database connection
        const isConnected = await database_1.database.testConnection();
        if (!isConnected) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connected successfully');
        // Start server
        app.listen(config_1.config.server.port, () => {
            console.log(`🚀 ChifaaCare API server running on port ${config_1.config.server.port}`);
            console.log(`📊 Environment: ${config_1.config.server.nodeEnv}`);
            console.log(`🌐 CORS Origin: ${config_1.config.cors.origin}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await database_1.database.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await database_1.database.close();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map