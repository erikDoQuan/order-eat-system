import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard';
// import { AccessTokenGuard } from '~/common/guards/access-token.guard';

export function RequireUser() {
  return applyDecorators(UseGuards(AccessTokenGuard));
}
