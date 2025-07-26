import { StartupDetail } from '@/components/startup-detail'

interface StartupPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { id } = await params
  return <StartupDetail startupId={id} />
} 