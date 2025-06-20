import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserGuard } from '~/common/guards/user.guard';

export function User() {
  return applyDecorators(UseGuards(UserGuard));
}
