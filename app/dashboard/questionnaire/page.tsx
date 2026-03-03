import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getQuestions } from "@/actions/questionnaire"
import { QuestionnaireManager } from "@/components/questionnaire-manager"

export const metadata = {
  title: "Questionnaire Management | IRA",
  description: "Manage IPO readiness assessment questions",
}

export default async function QuestionnairePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")
  if (session.user.role !== "REVIEWER") redirect("/dashboard")

  const result = await getQuestions()
  const questions = result.success ? result.data : []

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Questionnaire Management</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Manage the questions that assessors answer during IPO readiness assessment. Changes apply to all new and active (draft) assessments.
        </p>
      </div>

      <QuestionnaireManager initialQuestions={questions} />
    </div>
  )
}
