"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If no user is authenticated, show landing page
  if (!user) {
    return <LandingPage />
  }

  // If user exists but no profile or startup info, show onboarding
  if (!userProfile || !userProfile.startup_name) {
    return <OnboardingWizard />
  }

  // User is authenticated and has profile, show dashboard
  return <Dashboard />
}
