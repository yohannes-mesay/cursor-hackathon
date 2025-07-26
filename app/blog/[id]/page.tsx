import { BlogDetail } from '@/components/blog-detail'

interface BlogPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params
  return <BlogDetail postId={id} />
} 