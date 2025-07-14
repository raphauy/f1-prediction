"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkEmailAction, sendOtpAction, verifyOtpAction } from "./actions"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-poblar email desde query params
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setError("")

    startTransition(async () => {
      try {
        // Check if user exists first
        const checkResult = await checkEmailAction(email)
        
        if (!checkResult.success) {
          setError(checkResult.error || "Error verificando email")
          return
        }

        // Send OTP
        const otpResult = await sendOtpAction(email)
        
        if (!otpResult.success) {
          setError(otpResult.error || "Error enviando código")
          return
        }

        setStep("otp")
      } catch (error) {
        setError(error instanceof Error ? error.message : "Algo salió mal")
      }
    })
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    setError("")

    startTransition(async () => {
      try {
        const result = await verifyOtpAction(email, otp)
        
        if (!result.success) {
          setError(result.error || "Código inválido")
          return
        }

        // Redirigir al callbackUrl si existe, o dejar que middleware decida
        const callbackUrl = searchParams.get("callbackUrl")
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          router.refresh()
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Algo salió mal")
      }
    })
  }

  const handleBackToEmail = () => {
    setStep("email")
    setOtp("")
    setError("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>RC Starter Kit</CardTitle>
        <CardDescription>
          {step === "email" 
            ? searchParams.get("email") 
              ? "Completa el proceso para unirte al workspace"
              : "Ingresa tu email para recibir un código de acceso"
            : "Ingresa el código de 6 dígitos enviado a tu email"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar Código"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Ingresa código de 6 dígitos"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                disabled={isPending}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending || otp.length !== 6}>
              {isPending ? "Verificando..." : "Verificar Código"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleBackToEmail}
              disabled={isPending}
            >
              Volver al Email
            </Button>
          </form>
        )}
        
        {error && (
          <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}