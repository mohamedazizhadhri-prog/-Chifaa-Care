export interface JWTPayload {
    userId: number;
    email: string;
    role: 'PATIENT' | 'DOCTOR';
}
export declare class JWT {
    static generateAccessToken(payload: JWTPayload): string;
    static generateRefreshToken(payload: JWTPayload): string;
    static verifyAccessToken(token: string): JWTPayload;
    static verifyRefreshToken(token: string): JWTPayload;
}
//# sourceMappingURL=jwt.d.ts.map