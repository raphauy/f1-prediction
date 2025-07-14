import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "./onboarding-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OnboardingPageProps {
  searchParams: Promise<{
    workspace?: string
  }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const params = await searchParams
  const workspaceSlug = params.workspace

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            ¡Bienvenido!
          </CardTitle>
          <CardDescription>
            Completa tu perfil para comenzar a colaborar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando...</div>}>
            <OnboardingForm 
              user={session.user} 
              workspaceSlug={workspaceSlug}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}