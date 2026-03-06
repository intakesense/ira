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

  return <ClientDashboard lead={lead} />;
}