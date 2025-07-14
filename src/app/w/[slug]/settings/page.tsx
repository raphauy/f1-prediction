import { Suspense } from "react"
import { SettingsForm } from "./settings-form"
import { SettingsSkeleton } from "./settings-skeleton"

interface SettingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administra la configuración del workspace
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsForm slug={slug} />
      </Suspense>
    </div>
  )
}