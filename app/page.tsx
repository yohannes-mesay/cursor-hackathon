"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default function Home() {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // if (!user) {
  //   // return <AuthForm />
  //   return <OnboardingWizard />

  // }

  // if (!userProfile?.startup_name) {
  //   return <OnboardingWizard />
  // }

  return <Dashboard />
}
