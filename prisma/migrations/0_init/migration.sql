-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ASSESSOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_REVIEW', 'PAYMENT_PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('ELIGIBILITY', 'COMPANY', 'FINANCIAL', 'SECTOR');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PDF', 'JPG', 'JPEG', 'PNG');

-- CreateEnum
CREATE TYPE "OrganicSubmissionStatus" AS ENUM ('PENDING', 'CONVERTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ASSESSOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "probe42Fetched" BOOLEAN NOT NULL DEFAULT false,
    "probe42FetchedAt" TIMESTAMP(3),
    "probe42LegalName" TEXT,
    "probe42Status" TEXT,
    "probe42Classification" TEXT,
    "probe42AuthCapital" BIGINT,
    "probe42Pan" TEXT,
    "probe42Website" TEXT,
    "probe42IncorpDate" TIMESTAMP(3),
    "probe42ComplianceStatus" TEXT,
    "probe42DirectorCount" INTEGER,
    "probe42GstCount" INTEGER,
    "probe42Data" JSONB,
    "probe42ReportDownloaded" BOOLEAN NOT NULL DEFAULT false,
    "probe42ReportDownloadedAt" TIMESTAMP(3),
    "probe42ReportFailedAt" TIMESTAMP(3),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedAssessorId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assessorId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "companyVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyVerifiedAt" TIMESTAMP(3),
    "companyDataSnapshot" JSONB,
    "financialVerified" BOOLEAN NOT NULL DEFAULT false,
    "financialVerifiedAt" TIMESTAMP(3),
    "financialDataSnapshot" JSONB,
    "hasInvestmentPlan" BOOLEAN,
    "q2aGovernancePlan" BOOLEAN,
    "q2bFinancialReporting" BOOLEAN,
    "q2cControlSystems" BOOLEAN,
    "q2dShareholdingClear" BOOLEAN,
    "q3aSeniorManagement" BOOLEAN,
    "q3bIndependentBoard" BOOLEAN,
    "q3cMidManagement" BOOLEAN,
    "q3dKeyPersonnel" BOOLEAN,
    "q4PaidUpCapital" DOUBLE PRECISION,
    "q5OutstandingShares" INTEGER,
    "q6NetWorth" DOUBLE PRECISION,
    "q7Borrowings" DOUBLE PRECISION,
    "q8DebtEquityRatio" DOUBLE PRECISION,
    "q9TurnoverYear1" DOUBLE PRECISION,
    "q9TurnoverYear2" DOUBLE PRECISION,
    "q9TurnoverYear3" DOUBLE PRECISION,
    "q10EbitdaYear1" DOUBLE PRECISION,
    "q10EbitdaYear2" DOUBLE PRECISION,
    "q10EbitdaYear3" DOUBLE PRECISION,
    "q11Eps" DOUBLE PRECISION,
    "scoreBreakdown" JSONB,
    "totalScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "rating" TEXT,
    "probe42Fetched" BOOLEAN NOT NULL DEFAULT false,
    "probe42FetchedAt" TIMESTAMP(3),
    "probe42Data" JSONB,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewHistory" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "DocumentType" NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "helpText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organic_submission" (
    "id" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "status" "OrganicSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "convertedToLeadId" TEXT,
    "convertedById" TEXT,
    "convertedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organic_submission_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "lead_leadId_key" ON "lead"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_cin_key" ON "lead"("cin");

-- CreateIndex
CREATE INDEX "lead_status_idx" ON "lead"("status");

-- CreateIndex
CREATE INDEX "lead_assignedAssessorId_idx" ON "lead"("assignedAssessorId");

-- CreateIndex
CREATE INDEX "lead_createdById_idx" ON "lead"("createdById");

-- CreateIndex
CREATE INDEX "lead_leadId_idx" ON "lead"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_leadId_key" ON "assessment"("leadId");

-- CreateIndex
CREATE INDEX "assessment_assessorId_idx" ON "assessment"("assessorId");

-- CreateIndex
CREATE INDEX "assessment_status_idx" ON "assessment"("status");

-- CreateIndex
CREATE INDEX "assessment_status_submittedAt_idx" ON "assessment"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "assessment_currentStep_idx" ON "assessment"("currentStep");

-- CreateIndex
CREATE INDEX "assessment_leadId_status_idx" ON "assessment"("leadId", "status");

-- CreateIndex
CREATE INDEX "assessment_assessorId_status_idx" ON "assessment"("assessorId", "status");

-- CreateIndex
CREATE INDEX "document_leadId_idx" ON "document"("leadId");

-- CreateIndex
CREATE INDEX "document_uploadedById_idx" ON "document"("uploadedById");

-- CreateIndex
CREATE INDEX "question_type_order_idx" ON "question"("type", "order");

-- CreateIndex
CREATE INDEX "question_type_isActive_idx" ON "question"("type", "isActive");

-- CreateIndex
CREATE INDEX "audit_log_leadId_idx" ON "audit_log"("leadId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "organic_submission_emailVerificationToken_key" ON "organic_submission"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "organic_submission_status_idx" ON "organic_submission"("status");

-- CreateIndex
CREATE INDEX "organic_submission_submittedAt_idx" ON "organic_submission"("submittedAt");

-- CreateIndex
CREATE INDEX "organic_submission_isEmailVerified_idx" ON "organic_submission"("isEmailVerified");

-- CreateIndex
CREATE UNIQUE INDEX "organic_submission_cin_key" ON "organic_submission"("cin");

-- CreateIndex
CREATE UNIQUE INDEX "client_user_email_key" ON "client_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_user_leadId_key" ON "client_user"("leadId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_assignedAssessorId_fkey" FOREIGN KEY ("assignedAssessorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organic_submission" ADD CONSTRAINT "organic_submission_convertedToLeadId_fkey" FOREIGN KEY ("convertedToLeadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organic_submission" ADD CONSTRAINT "organic_submission_convertedById_fkey" FOREIGN KEY ("convertedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organic_submission" ADD CONSTRAINT "organic_submission_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_user" ADD CONSTRAINT "client_user_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

