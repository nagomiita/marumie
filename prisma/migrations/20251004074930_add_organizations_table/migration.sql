-- CreateEnum
CREATE TYPE "public"."OrganizationType" AS ENUM ('household', 'business', 'nonprofit', 'other');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "public"."OrganizationType" NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "user_id" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_user_id_type_idx" ON "public"."organizations"("user_id", "type");
