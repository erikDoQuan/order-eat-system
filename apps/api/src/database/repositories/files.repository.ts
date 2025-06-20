import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, or, SQL } from 'drizzle-orm';

import { SORT_ORDER } from '~/common/constants/order.constant';
import { PaginationResponseDto } from '~/common/dtos/pagination-response.dto';
import { PaginationDto } from '~/common/dtos/pagination.dto';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { File, FileInsert, files, FileUpdate } from '~/database/schema';
import { FilterFileDto } from '~/modules/files/dto/filter-file.dto';

@Injectable()
export class FileRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(data: FileInsert): Promise<File> {
    const [result] = await this.drizzle.db.insert(files).values(data).returning();

    return result;
  }

  async findById(id: string): Promise<File | null> {
    const result = await this.drizzle.db.query.files.findFirst({
      where: and(eq(files.id, id), eq(files.isActive, true)),
    });

    return result ?? null;
  }

  async find(filterDto: FilterFileDto): Promise<PaginationResponseDto<File>> {
    const { q, sort, order, skip, limit, mime, status } = filterDto;

    const whereConditions: SQL<unknown>[] = [];

    if (status) {
      whereConditions.push(or(...status.map(s => eq(files.status, s))));
    }

    if (q) {
      whereConditions.push(or(ilike(files.name, `%${q}%`), ilike(files.uniqueName, `%${q}%`), ilike(files.caption, `%${q}%`)));
    }

    if (mime) {
      whereConditions.push(ilike(files.mime, `${mime}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    let orderBy: SQL<unknown>;
    if (sort) {
      if (order) {
        orderBy = order === SORT_ORDER.ASC ? asc(files[sort]) : desc(files[sort]);
      } else {
        orderBy = desc(files[sort]);
      }
    } else {
      orderBy = desc(files.createdAt);
    }

    const totalItems = await this.drizzle.db
      .select({ count: count() })
      .from(files)
      .where(whereClause)
      .execute()
      .then(result => Number(result[0]?.count || 0));

    const data = await this.drizzle.db.query.files.findMany({
      where: whereClause,
      limit: limit,
      offset: skip,
      orderBy: orderBy,
    });

    const paginationDto = new PaginationDto({ filterDto, totalItems });

    return new PaginationResponseDto(data, { paging: paginationDto });
  }

  async delete(id: string): Promise<File | null> {
    const [result] = await this.drizzle.db
      .update(files)
      .set({
        isActive: false,
        updatedAt: new Date(),
      } as FileUpdate)
      .where(eq(files.id, id))
      .returning();

    return result;
  }
}
