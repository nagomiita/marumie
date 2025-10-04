import type { PrismaClient } from "@prisma/client";
import type { PersonalTransaction } from "@/shared/models/personal-transaction";
import type {
  PersonalTransactionRepository,
  PersonalTransactionCreateInput,
  PersonalTransactionFilter,
} from "./interfaces/personal-transaction-repository.interface";

export class PrismaPersonalTransactionRepository
  implements PersonalTransactionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByHash(hash: string): Promise<PersonalTransaction | null> {
    const record = await this.prisma.personalTransaction.findFirst({
      where: { hash },
    });

    return record ? this.mapToPersonalTransaction(record) : null;
  }

  async findByHashes(hashes: string[]): Promise<PersonalTransaction[]> {
    const startTime = Date.now();
    console.log("[DEBUG] Repository findByHashes start:", {
      hashCount: hashes.length,
      timestamp: new Date().toISOString(),
    });

    if (hashes.length === 0) {
      console.log("[DEBUG] Empty hashes array, returning empty result");
      return [];
    }

    try {
      const queryStart = Date.now();
      const records = await this.prisma.personalTransaction.findMany({
        where: {
          hash: {
            in: hashes,
          },
        },
      });

      console.log("[DEBUG] Repository query completed:", {
        queryDuration: Date.now() - queryStart,
        foundRecords: records.length,
        requestedHashes: hashes.length,
      });

      const mapStart = Date.now();
      const result = records.map(this.mapToPersonalTransaction);

      console.log("[DEBUG] Repository findByHashes completed:", {
        mappingDuration: Date.now() - mapStart,
        totalDuration: Date.now() - startTime,
        resultCount: result.length,
      });

      return result;
    } catch (error) {
      console.error("[ERROR] Repository findByHashes error:", {
        error: error instanceof Error ? error.message : String(error),
        hashCount: hashes.length,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  async findMany(
    filter: PersonalTransactionFilter,
    limit = 100,
    offset = 0,
  ): Promise<PersonalTransaction[]> {
    const where = this.buildWhereClause(filter);

    const records = await this.prisma.personalTransaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
      skip: offset,
    });

    return records.map(this.mapToPersonalTransaction);
  }

  async create(
    data: PersonalTransactionCreateInput,
  ): Promise<PersonalTransaction> {
    const record = await this.prisma.personalTransaction.create({
      data: {
        organizationId: data.organizationId,
        date: data.date,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount,
        type: data.type,
        paymentMethod: data.paymentMethod,
        description: data.description,
        memo: data.memo,
        hash: data.hash,
      },
    });

    return this.mapToPersonalTransaction(record);
  }

  async createMany(data: PersonalTransactionCreateInput[]): Promise<number> {
    const result = await this.prisma.personalTransaction.createMany({
      data: data.map((item) => ({
        organizationId: item.organizationId,
        date: item.date,
        category: item.category,
        subcategory: item.subcategory,
        amount: item.amount,
        type: item.type,
        paymentMethod: item.paymentMethod,
        description: item.description,
        memo: item.memo,
        hash: item.hash,
      })),
    });

    return result.count;
  }

  async update(
    id: string,
    data: Partial<PersonalTransactionCreateInput>,
  ): Promise<PersonalTransaction> {
    const record = await this.prisma.personalTransaction.update({
      where: { id },
      data: {
        organizationId: data.organizationId,
        date: data.date,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount,
        type: data.type,
        paymentMethod: data.paymentMethod,
        description: data.description,
        memo: data.memo,
        hash: data.hash,
      },
    });

    return this.mapToPersonalTransaction(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.personalTransaction.delete({
      where: { id },
    });
  }

  async deleteAll(): Promise<number> {
    const result = await this.prisma.personalTransaction.deleteMany();
    return result.count;
  }

  async count(filter: PersonalTransactionFilter): Promise<number> {
    const where = this.buildWhereClause(filter);
    return await this.prisma.personalTransaction.count({ where });
  }

  private buildWhereClause(filter: PersonalTransactionFilter) {
    const where: any = {};

    if (filter.organizationId) {
      where.organizationId = filter.organizationId;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.date = {};
      if (filter.dateFrom) {
        where.date.gte = filter.dateFrom;
      }
      if (filter.dateTo) {
        where.date.lte = filter.dateTo;
      }
    }

    if (filter.category) {
      where.category = filter.category;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.paymentMethod) {
      where.paymentMethod = filter.paymentMethod;
    }

    return where;
  }

  private mapToPersonalTransaction(record: any): PersonalTransaction {
    return {
      id: record.id,
      date: record.date,
      category: record.category,
      subcategory: record.subcategory,
      amount: Number(record.amount),
      type: record.type,
      payment_method: record.paymentMethod,
      description: record.description,
      memo: record.memo,
      hash: record.hash,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    };
  }
}
