import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { CreateRefreshTokenDto } from '~/modules/refresh-tokens/dto/create-refresh-token.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { RefreshToken, refreshTokens } from '../schema';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(data: CreateRefreshTokenDto): Promise<RefreshToken> {
    const userId = data.userId || data.user?.id;

    if (!userId) {
      throw new Error('User ID is required for creating a refresh token');
    }

    const refreshTokenData = {
      token: data.token,
      createdByIp: data.createdByIp || '',
      userAgent: data.userAgent || '',
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: data.revokedAt,
    };

    const [result] = await this.drizzle.db.insert(refreshTokens).values(refreshTokenData).returning();
    return result;
  }

  async findByToken(token: string, ipAddress: string, _userAgent: string): Promise<RefreshToken | null> {
    const refreshToken = await this.drizzle.db.query.refreshTokens.findFirst({
      where: and(eq(refreshTokens.token, token), eq(refreshTokens.createdByIp, ipAddress)),
    });

    if (!refreshToken) throw new NotFoundException('Refresh token not found');

    return refreshToken;
  }

  async revoke(token: string, ipAddress: string, userAgent: string) {
    const refreshToken = await this.findByToken(token, ipAddress, userAgent);

    refreshToken.revokedByIp = ipAddress;
    refreshToken.revokedAt = new Date();
    await this.drizzle.db.update(refreshTokens).set(refreshToken);

    return { status: 'success' };
  }
}
