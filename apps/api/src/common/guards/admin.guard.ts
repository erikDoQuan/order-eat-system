import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { User } from '~/database/schema';
import { USER_ROLE } from '~/modules/user/constants/users.constant';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user || user.role?.toLowerCase() !== USER_ROLE.ADMIN.toLowerCase()) {
      throw new ForbiddenException('Only admin can access this resource');
    }

    return true;
  }
}
