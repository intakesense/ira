import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ClientDashboard from "./ClientDashboard";

export default async function ClientPortalPage() {
  const cookieStore = await cookies();
  const leadId = cookieStore.get("client_portal_lead")?.value;

  if (!leadId) {
    redirect("/client-portal/login");
  }

  const lead = await prisma.lead.findUnique({
    where: { leadId },
    include: {
      assessment: true,
      documents: true,
      assignedAssessor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!lead || lead.status !== "COMPLETED") {
    redirect("/client-portal/login");
  }

  return (
    <ClientDashboard
      lead={{
        leadDbId: lead.id, // ← cuid for upload API
        companyName: lead.companyName,
        contactPerson: lead.contactPerson,
        cin: lead.cin,
        assessment: lead.assessment
          ? {
              totalScore: lead.assessment.totalScore,
              percentage: lead.assessment.percentage,
              rating: lead.assessment.rating,
              q9TurnoverYear1: lead.assessment.q9TurnoverYear1,
              q9TurnoverYear2: lead.assessment.q9TurnoverYear2,
              q9TurnoverYear3: lead.assessment.q9TurnoverYear3,
              q10EbitdaYear1: lead.assessment.q10EbitdaYear1,
              q10EbitdaYear2: lead.assessment.q10EbitdaYear2,
              q10EbitdaYear3: lead.assessment.q10EbitdaYear3,
              q4PaidUpCapital: lead.assessment.q4PaidUpCapital,
              q6NetWorth: lead.assessment.q6NetWorth,
              q7Borrowings: lead.assessment.q7Borrowings,
              q8DebtEquityRatio: lead.assessment.q8DebtEquityRatio,
              q11Eps: lead.assessment.q11Eps,
              hasInvestmentPlan: lead.assessment.hasInvestmentPlan,
              q2aGovernancePlan: lead.assessment.q2aGovernancePlan,
              q2bFinancialReporting: lead.assessment.q2bFinancialReporting,
              q2cControlSystems: lead.assessment.q2cControlSystems,
              q2dShareholdingClear: lead.assessment.q2dShareholdingClear,
              q3aSeniorManagement: lead.assessment.q3aSeniorManagement,
              q3bIndependentBoard: lead.assessment.q3bIndependentBoard,
              q3cMidManagement: lead.assessment.q3cMidManagement,
              q3dKeyPersonnel: lead.assessment.q3dKeyPersonnel,
            }
          : null,
        documents: lead.documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          uploadedAt: doc.uploadedAt,
        })),
        assignedAssessor: lead.assignedAssessor,
      }}
    />
  );
}
