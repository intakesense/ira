-- DropForeignKey
ALTER TABLE "public"."assessment_answer" DROP CONSTRAINT "assessment_answer_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."assessment_answer" DROP CONSTRAINT "assessment_answer_questionId_fkey";

-- DropIndex
DROP INDEX "public"."question_isActive_order_idx";

-- AlterTable
ALTER TABLE "assessment" DROP COLUMN "questionsSnapshot",
DROP COLUMN "usesDynamicQuestions";

-- AlterTable
ALTER TABLE "lead" DROP COLUMN "probe42PaidUpCapital";

-- AlterTable
ALTER TABLE "question" DROP COLUMN "displayNumber",
DROP COLUMN "inputType",
DROP COLUMN "maxScore",
DROP COLUMN "options",
DROP COLUMN "section",
DROP COLUMN "unit",
ALTER COLUMN "type" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."assessment_answer";

-- CreateTable
CREATE TABLE "client_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_user_email_key" ON "client_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_user_leadId_key" ON "client_user"("leadId");

-- AddForeignKey
ALTER TABLE "client_user" ADD CONSTRAINT "client_user_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

