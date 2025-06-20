import { Injectable } from '@nestjs/common';

import { checkValidPassword } from '~/common/utils/password.util';
import { UserRepository } from '~/database/repositories/user.repository';
import { User } from '~/database/schema';

@Injectable()
export class AuthBaseService {
  constructor(private readonly userRepository: UserRepository) {}

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepository.findByEmailWithPassword(normalizedEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await checkValidPassword(user.password, password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return checkValidPassword(user.password, password);
  }
}
