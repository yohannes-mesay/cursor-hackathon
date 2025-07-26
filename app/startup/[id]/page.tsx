import { StartupDetail } from '@/components/startup-detail'

interface StartupPageProps {
  params: {
    id: string
  }
}

export default function StartupPage({ params }: StartupPageProps) {
  return <StartupDetail startupId={params.id} />
} 