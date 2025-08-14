import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.guard';
export declare const roleGuard: (allowedRoles: ("PATIENT" | "DOCTOR")[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.guard.d.ts.map