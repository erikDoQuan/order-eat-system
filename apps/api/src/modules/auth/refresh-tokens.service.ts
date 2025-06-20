import { Injectable, NotFoundException } from '@nestjs/common';

import { RefreshTokenRepository } from '~/database/repositories/refresh-token.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { RefreshToken } from '~/database/schema';
import { CreateRefreshTokenDto } from '../refresh-tokens/dto/create-refresh-token.dto';
import { TokenService } from './token.service';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}
  async create(createRefreshTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
    return this.refreshTokenRepository.create(createRefreshTokenDto);
  }

  async findByToken(token: string, ipAddress: string, _userAgent: string): Promise<RefreshToken> {
    return this.refreshTokenRepository.findByToken(token, ipAddress, _userAgent);
  }

  async refresh(userId: string, token: string, ipAddress: string, userAgent: string) {
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentRefreshToken = await this.refreshTokenRepository.findByToken(token, ipAddress, userAgent);

    const accessToken = this.tokenService.createAccessToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
      },
      accessToken,
      refreshToken: currentRefreshToken.token,
    };
  }

  async revoke(token: string, ipAddress: string, userAgent: string) {
    return this.refreshTokenRepository.revoke(token, ipAddress, userAgent);
  }
}
