import { GrantDetail } from '@/components/grant-detail'

interface GrantPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GrantPage({ params }: GrantPageProps) {
  const { id } = await params
  return <GrantDetail grantId={id} />
} 