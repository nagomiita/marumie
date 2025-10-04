import type {
  PersonalTransaction,
  PersonalTransactionType,
} from "@/shared/models/personal-transaction";

export interface PersonalTransactionCreateInput {
  organizationId?: string;
  date: Date;
  category: string;
  subcategory?: string;
  amount: number;
  type: PersonalTransactionType;
  paymentMethod: string;
  description: string;
  memo?: string;
  hash: string;
}

export interface PersonalTransactionFilter {
  organizationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  type?: PersonalTransactionType;
  paymentMethod?: string;
}

export interface PersonalTransactionRepository {
  findByHash(hash: string): Promise<PersonalTransaction | null>;
  findByHashes(hashes: string[]): Promise<PersonalTransaction[]>;
  findMany(
    filter: PersonalTransactionFilter,
    limit?: number,
    offset?: number,
  ): Promise<PersonalTransaction[]>;
  create(data: PersonalTransactionCreateInput): Promise<PersonalTransaction>;
  createMany(data: PersonalTransactionCreateInput[]): Promise<number>;
  update(
    id: string,
    data: Partial<PersonalTransactionCreateInput>,
  ): Promise<PersonalTransaction>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<number>;
  count(filter: PersonalTransactionFilter): Promise<number>;
}
