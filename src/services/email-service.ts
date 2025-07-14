import { Resend } from 'resend'
import { z } from 'zod'
import WorkspaceInvitationEmail from '@/components/emails/workspace-invitation-email'
import OtpEmail from '@/components/emails/otp-email'

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquemas de validación
export const sendInvitationEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  inviterName: z.string().min(1, "Nombre del invitador requerido"),
  workspaceName: z.string().min(1, "Nombre del workspace requerido"),
  acceptUrl: z.string().url("URL de aceptación inválida"),
  expiresInDays: z.number().min(1).max(30).default(7)
})

// Tipos
export type SendInvitationEmailInput = z.infer<typeof sendInvitationEmailSchema>

/**
 * Envía un email de invitación al workspace
 */
export async function sendWorkspaceInvitationEmail(input: SendInvitationEmailInput) {
  try {
    const validatedInput = sendInvitationEmailSchema.parse(input)
    
    const appName = process.env.APP_NAME || "RC Starter Kit"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
    
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [validatedInput.to],
      subject: `Invitación a "${validatedInput.workspaceName}" en ${appName}`,
      react: WorkspaceInvitationEmail({
        invitedUserEmail: validatedInput.to,
        inviterName: validatedInput.inviterName,
        workspaceName: validatedInput.workspaceName,
        acceptUrl: validatedInput.acceptUrl,
        appName,
        expiresInDays: validatedInput.expiresInDays
      }),
    })
    
    if (error) {
      console.error('Error sending invitation email:', error)
      return { 
        success: false, 
        error: `Error al enviar el email: ${error.message}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        emailId: data?.id,
        message: "Email de invitación enviado correctamente" 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error sending invitation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el email de invitación' 
    }
  }
}

/**
 * Genera la URL de aceptación de invitación
 */
export function generateInvitationAcceptUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}

// Esquemas de validación para OTP
export const sendOtpEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  otp: z.string().min(6, "OTP debe tener al menos 6 caracteres"),
})

export type SendOtpEmailInput = z.infer<typeof sendOtpEmailSchema>

/**
 * Envía un email con el código OTP
 */
export async function sendOtpEmail(input: SendOtpEmailInput) {
  try {
    const validatedInput = sendOtpEmailSchema.parse(input)
    
    const appName = process.env.APP_NAME || "RC Starter Kit"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
    
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [validatedInput.to],
      subject: `Tu código de verificación de ${appName}`,
      react: OtpEmail({
        otp: validatedInput.otp,
        appName
      }),
    })
    
    if (error) {
      console.error('Error sending OTP email:', error)
      return { 
        success: false, 
        error: `Error al enviar el email: ${error.message}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        emailId: data?.id,
        message: "Email OTP enviado correctamente" 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error sending OTP email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el email OTP' 
    }
  }
}