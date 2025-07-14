import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function InviteLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 text-center">
          Procesando tu invitación...
        </p>
      </CardContent>
    </Card>
  )
}