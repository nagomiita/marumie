export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: string;
  slug: string;
  userId?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRepository {
  findBySlug(slug: string): Promise<Organization | null>;
  findMany(): Promise<Organization[]>;
  findById(id: string): Promise<Organization | null>;
}
