import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

    const headerToken = request.headers['x-csrf-token'];
    const cookieToken = request.cookies?.['csrf-token'];

    if (!headerToken || !cookieToken) throw new ForbiddenException('CSRF token missing');
    if (headerToken !== cookieToken) throw new ForbiddenException('CSRF token mismatch');

    return true;
  }

  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
