import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../utils/jwt';
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
export declare const authGuard: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.guard.d.ts.map