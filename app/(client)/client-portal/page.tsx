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
      assessment: {
        include: {
          answers: {
            include: {
              question: true,
            },
            orderBy: {
              question: {
                order: "asc",
              },
            },
          },
        },
      },
      documents: true,
      assignedAssessor: {
        select: { id: true, name: true, email: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
  });

  if (!lead || lead.status !== "COMPLETED") {
    redirect("/client-portal/login");
  }

  // Transform answers to the format expected by ClientDashboard
  const transformedAnswers = lead.assessment?.answers.map((answer) => ({
    questionId: answer.questionId,
    questionText: answer.question.text,
    section: answer.question.section,
    displayNumber: answer.question.displayNumber,
    answerValue: answer.answerValue,
    score: answer.score,
    maxScore: answer.question.maxScore,
    inputType: answer.question.inputType,
    unit: answer.question.unit,
  })) ?? [];

  return (
    <ClientDashboard
      lead={{
        leadDbId: lead.id,
        reviewerName: lead.createdBy.name,
        companyName: lead.companyName,
        contactPerson: lead.contactPerson,
        cin: lead.cin,
        createdAt: lead.createdAt,
        paymentLinkSentAt: lead.paymentLinkSentAt ?? null,
        portalAccessSentAt: lead.portalAccessSentAt ?? null,
        assessment: lead.assessment
          ? {
              totalScore: lead.assessment.totalScore,
              maxScore: lead.assessment.maxScore,
              percentage: lead.assessment.percentage,
              rating: lead.assessment.rating,
              answers: transformedAnswers,
              scoreBreakdown: lead.assessment.scoreBreakdown as Record<
                string,
                { questionText: string; score: number; maxScore: number }
              > | null,
            }
          : null,
        documents: lead.documents
          .filter((doc) => doc.source === "CLIENT")
          .map((doc) => ({
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
