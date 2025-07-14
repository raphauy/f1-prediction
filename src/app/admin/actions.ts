"use server"

import { signOut } from "@/lib/auth"

/**
 * Cierra la sesión del usuario
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}