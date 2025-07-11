import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, or, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { checkValidPassword } from '~/common/utils/password.util';
import { UserResult } from '~/database/interfaces/user.interface';
import { CreateUserDto } from '~/modules/user/dto/create-user.dto';
import { FetchUsersDto, FetchUsersResponseDto } from '~/modules/user/dto/fetch-user.dto';
import { UpdateUserDto } from '~/modules/user/dto/update-user.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { User, users, UserUpdate, UserWithoutPassword } from '../schema';

@Injectable()
export class UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchUsersDto: FetchUsersDto): Promise<UserResult> {
    const { search, offset, limit, status } = fetchUsersDto;

    const baseConditions: SQL[] = [];

    if (status) {
      baseConditions.push(inArray(users.isActive, status));
    }

    if (search?.trim()) {
      const searchTerm = `%${removeDiacritics(search.trim())}%`;
      baseConditions.push(or(ilike(sql`unaccent(${users.firstName})`, searchTerm), ilike(sql`unaccent(${users.lastName})`, searchTerm)));
    }

    const whereCondition = and(...baseConditions);

    const query = await this.drizzle.db.query.users.findMany({
      where: whereCondition,
      limit: limit,
      offset: offset,
      orderBy: desc(users.createdAt),
      columns: {
        password: false,
      },
    });

    const countQuery = await this.drizzle.db.select({ count: count() }).from(users).where(whereCondition);

    const [results, countResult] = await Promise.all([query, countQuery]);

    return {
      data: results as unknown as FetchUsersResponseDto[],
      totalItems: countResult?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<UserWithoutPassword | null> {
    return this.drizzle.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        password: false,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    const normalizedEmail = email.trim().toLowerCase();
    
    const result = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: {
        password: false,
      },
    });
    
    // Chỉ trả về user đang active
    if (result && !result.isActive) {
      return null;
    }
    
    return result;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });
    
    // Chỉ trả về user đang active
    if (result && !result.isActive) {
      return null;
    }
    
    return result;
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);

    if (!user) return null;

    const isValidPassword = await checkValidPassword(user.password, password);

    if (!isValidPassword) return null;

    return user;
  }

  async create(data: CreateUserDto): Promise<UserWithoutPassword> {
    const [user] = await this.drizzle.db.insert(users).values(data).returning();
    return this.findOne(user.id);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserWithoutPassword | null> {
    const [updated] = await this.drizzle.db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated ? this.findOne(updated.id) : null;
  }

  async delete(id: string): Promise<UserWithoutPassword | null> {
    const [deleted] = await this.drizzle.db
      .update(users)
      .set({ isActive: false } as UserUpdate)
      .where(eq(users.id, id))
      .returning();
    return deleted ? this.findOne(deleted.id) : null;
  }

  // Method để debug - kiểm tra tất cả email trong database
  async getAllEmails(): Promise<{ id: string; email: string }[]> {
    const allUsers = await this.drizzle.db.select({ id: users.id, email: users.email }).from(users);
    return allUsers;
  }

  // Method để tìm user inactive theo email
  async findInactiveByEmail(email: string): Promise<UserWithoutPassword | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: {
        password: false,
      },
    });
    
    // Chỉ trả về user inactive
    if (result && !result.isActive) {
      return result;
    }
    
    return null;
  }

  // Tìm user theo email, bất kể isActive
  async findByEmailWithInactive(email: string): Promise<UserWithoutPassword | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.drizzle.db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: {
        password: false,
      },
    });
  }

  // Xóa hoàn toàn user khỏi database (dùng cho đăng ký thất bại)
  async remove(id: string): Promise<void> {
    await this.drizzle.db.delete(users).where(eq(users.id, id));
  }
}
