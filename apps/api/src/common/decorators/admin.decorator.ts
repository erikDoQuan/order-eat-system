import { applyDecorators, UseGuards } from '@nestjs/common';

import { AdminGuard } from '~/common/guards/admin.guard';

export function Admin() {
  return applyDecorators(UseGuards(AdminGuard));
}
