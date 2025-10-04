export type OrganizationType = "household" | "business" | "nonprofit" | "other";

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: OrganizationType;
  slug: string;
  userId?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  displayName: string;
  description?: string;
  type: OrganizationType;
  slug: string;
  userId?: string;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationInput {
  name?: string;
  displayName?: string;
  description?: string;
  type?: OrganizationType;
  slug?: string;
  settings?: Record<string, any>;
}