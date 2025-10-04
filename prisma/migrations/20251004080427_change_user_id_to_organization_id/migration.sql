/*
  Warnings:

  - You are about to drop the column `user_id` on the `personal_transactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."personal_transactions_user_id_date_idx";

-- AlterTable
ALTER TABLE "public"."personal_transactions" DROP COLUMN "user_id",
ADD COLUMN     "organization_id" TEXT;

-- CreateIndex
CREATE INDEX "personal_transactions_organization_id_date_idx" ON "public"."personal_transactions"("organization_id", "date" DESC);

-- AddForeignKey
ALTER TABLE "public"."personal_transactions" ADD CONSTRAINT "personal_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
