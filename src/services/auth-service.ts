import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type OtpToken } from "@prisma/client"

// ✅ Validaciones al inicio del archivo
export const createOtpSchema = z.object({
  userId: z.string().min(1, "User ID requerido"),
  token: z.string().length(6, "Token debe tener 6 dígitos"),
  expiresAt: z.date()
})

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, "User ID requerido"),
  token: z.string().length(6, "Token debe tener 6 dígitos")
})

// Tipos derivados de schemas
export type CreateOtpData = z.infer<typeof createOtpSchema>
export type VerifyOtpData = z.infer<typeof verifyOtpSchema>

/**
 * Genera un token OTP de 6 dígitos
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Crea un nuevo token OTP
 */
export async function createOtpToken(data: CreateOtpData): Promise<OtpToken> {
  const validated = createOtpSchema.parse(data)
  return await prisma.otpToken.create({
    data: validated
  })
}

/**
 * Verifica un token OTP y lo marca como usado
 */
export async function verifyOtpToken(data: VerifyOtpData): Promise<OtpToken | null> {
  const validated = verifyOtpSchema.parse(data)
  
  // Buscar token válido
  const otpToken = await prisma.otpToken.findFirst({
    where: {
      userId: validated.userId,
      token: validated.token,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    }
  })

  if (!otpToken) {
    return null
  }

  // Marcar como usado
  return await prisma.otpToken.update({
    where: { id: otpToken.id },
    data: { used: true }
  })
}

/**
 * Elimina tokens OTP expirados
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.otpToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}