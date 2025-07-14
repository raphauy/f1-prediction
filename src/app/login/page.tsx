"use client"

import { Suspense } from "react"
import { LoginForm } from "./login-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      {/* Theme Toggle in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Suspense fallback={<div>Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}