import { z } from 'zod';
export declare const signupSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    role: z.ZodEnum<["PATIENT", "DOCTOR"]>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}>, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}>, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}, {
    password: string;
    fullName: string;
    email: string;
    confirmPassword: string;
    role: "PATIENT" | "DOCTOR";
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["PATIENT", "DOCTOR"]>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    role: "PATIENT" | "DOCTOR";
}, {
    password: string;
    email: string;
    role: "PATIENT" | "DOCTOR";
}>;
export interface SignupData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'PATIENT' | 'DOCTOR';
    licenseNumber?: string;
    specialty?: string;
}
export interface LoginData {
    email: string;
    password: string;
    role: 'PATIENT' | 'DOCTOR';
}
export interface User {
    id: number;
    full_name: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR';
    license_number?: string;
    specialty?: string;
    created_at: Date;
}
export declare class AuthService {
    static signup(data: SignupData): Promise<{
        user: Omit<User, 'password_hash'>;
        accessToken: string;
        refreshToken: string;
    }>;
    static login(data: LoginData): Promise<{
        user: Omit<User, 'password_hash'>;
        accessToken: string;
        refreshToken: string;
    }>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static getUserById(userId: number): Promise<Omit<User, 'password_hash'> | null>;
}
//# sourceMappingURL=auth.service.d.ts.map