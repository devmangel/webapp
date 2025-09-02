"use client"

import React from "react"
import { GoogleSignInButton, GitHubSignInButton } from "../../components/auth/SignInButton"

interface LoginClientProps {
  callbackUrl?: string
}

export default function LoginClient({ callbackUrl = "/dashboard" }: LoginClientProps) {
  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <GitHubSignInButton callbackUrl={callbackUrl} />
    </div>
  )
}
