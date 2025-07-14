"use server"

import { getUserByEmail, createUser } from "@/services/user-service"
import { generateOtp, createOtpToken } from "@/services/auth-service"
import { sendOtpEmail } from "@/services/email-service"
import { signIn } from "@/lib/auth"

export type AuthResult = {
  success: boolean
  error?: string
}

/**
 * Verifica si el email existe en la base de datos o lo permite para registro automático
 */
export async function checkEmailAction(email: string): Promise<AuthResult> {
  try {
    if (!email) {
      return { success: false, error: "Email es requerido" }
    }

    // En un sistema con invitaciones, permitimos cualquier email válido
    // El usuario se creará automáticamente durante la verificación OTP si no existe
    return { success: true }
  } catch (error) {
    console.error("Error checking email:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

/**
 * Envía OTP al email del usuario
 */
export async function sendOtpAction(email: string): Promise<AuthResult> {
  try {
    if (!email) {
      return { success: false, error: "Email es requerido" }
    }

    // Verificar si el usuario existe, si no, crear uno nuevo
    let user = await getUserByEmail(email)
    if (!user) {
      const newUser = await createUser({ 
        email,
        isOnboarded: false // Nuevos usuarios necesitan onboarding
      })
      // Convertir a UserWithStringRole para compatibilidad
      user = {
        ...newUser,
        role: newUser.role || ""
      }
    }

    // Generar OTP
    const otp = generateOtp()
    
    // Guardar OTP en base de datos
    await createOtpToken({
      userId: user.id,
      token: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Enviar email
    const emailResult = await sendOtpEmail({ to: email, otp })
    
    if (!emailResult.success) {
      console.error("Error sending OTP email:", emailResult.error)
      return { success: false, error: "Error al enviar el código OTP por email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending OTP:", error)
    return { success: false, error: "Error al enviar código OTP" }
  }
}

/**
 * Verifica el código OTP y autentica al usuario
 */
export async function verifyOtpAction(email: string, otp: string): Promise<AuthResult> {
  try {
    if (!email || !otp) {
      return { success: false, error: "Email y código OTP son requeridos" }
    }

    if (otp.length !== 6) {
      return { success: false, error: "El código debe tener 6 dígitos" }
    }

    // Usar el provider credentials para verificar OTP
    const result = await signIn("credentials", {
      email,
      otp,
      redirect: false
    })

    if (result?.error) {
      return { success: false, error: "Código OTP inválido o expirado" }
    }

    // Si llegamos aquí, la autenticación fue exitosa
    // El middleware se encargará de la redirección
    return { success: true }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return { success: false, error: "Error al verificar código OTP" }
  }
}