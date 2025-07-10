import { Injectable } from '@nestjs/common';
import { eq, and, lt } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service';
import { emailVerifications, EmailVerification, EmailVerificationInsert, EmailVerificationUpdate } from '../schema';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(data: EmailVerificationInsert): Promise<EmailVerification> {
    const [result] = await this.drizzleService.db.insert(emailVerifications).values(data).returning();
    return result;
  }

  async findByToken(token: string): Promise<EmailVerification | null> {
    const [result] = await this.drizzleService.db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token));
    return result || null;
  }

  async findByUserId(userId: string): Promise<EmailVerification | null> {
    const [result] = await this.drizzleService.db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.userId, userId));
    return result || null;
  }

  async markAsVerified(token: string): Promise<EmailVerification | null> {
    const [result] = await this.drizzleService.db
      .update(emailVerifications)
      .set({ verifiedAt: new Date() } as EmailVerificationUpdate)
      .where(eq(emailVerifications.token, token))
      .returning();
    return result || null;
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.drizzleService.db
      .delete(emailVerifications)
      .where(lt(emailVerifications.expiresAt, new Date()));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.drizzleService.db
      .delete(emailVerifications)
      .where(eq(emailVerifications.userId, userId));
  }
} 