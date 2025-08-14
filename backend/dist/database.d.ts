import mysql from 'mysql2/promise';
declare class Database {
    private pool;
    constructor();
    getConnection(): Promise<mysql.PoolConnection>;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader>;
    close(): Promise<void>;
    testConnection(): Promise<boolean>;
}
export declare const database: Database;
export default database;
//# sourceMappingURL=database.d.ts.map