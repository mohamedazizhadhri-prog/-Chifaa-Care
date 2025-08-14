"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("./config");
class Database {
    constructor() {
        this.pool = promise_1.default.createPool({
            host: config_1.config.database.host,
            user: config_1.config.database.user,
            password: config_1.config.database.password,
            database: config_1.config.database.database,
            port: config_1.config.database.port,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    async getConnection() {
        return await this.pool.getConnection();
    }
    async query(sql, params) {
        const [rows] = await this.pool.execute(sql, params);
        return rows;
    }
    async execute(sql, params) {
        const [result] = await this.pool.execute(sql, params);
        return result;
    }
    async close() {
        await this.pool.end();
    }
    async testConnection() {
        try {
            const connection = await this.getConnection();
            await connection.ping();
            connection.release();
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}
exports.database = new Database();
exports.default = exports.database;
//# sourceMappingURL=database.js.map