-- CreateEnum
CREATE TYPE "public"."PersonalTransactionType" AS ENUM ('income', 'expense');

-- CreateTable
CREATE TABLE "public"."personal_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "date" DATE NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "subcategory" VARCHAR(255),
    "amount" DECIMAL(15,2) NOT NULL,
    "type" "public"."PersonalTransactionType" NOT NULL,
    "payment_method" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "memo" TEXT,
    "hash" VARCHAR(255) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_transactions_user_id_date_idx" ON "public"."personal_transactions"("user_id", "date" DESC);

-- CreateIndex
CREATE INDEX "personal_transactions_category_type_idx" ON "public"."personal_transactions"("category", "type");
