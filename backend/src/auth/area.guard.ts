import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from './interfaces';

@Injectable()
export class AreaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload; areaId?: string }>();
    const user = request.user;

    if (!user) {
      return true;
    }

    const requestedArea = (context.switchToHttp().getRequest().headers['x-area-id'] as string) ?? undefined;
    const userAreas = (user as any).areas as string[] | undefined;

    if (requestedArea && userAreas && userAreas.length > 0) {
      const hasAccess = userAreas.includes(requestedArea);
      if (!hasAccess) {
        throw new ForbiddenException(`Access denied for area: ${requestedArea}`);
      }
      request.areaId = requestedArea;
    }

    return true;
  }
}
