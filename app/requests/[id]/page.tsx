import { RequestDetail } from '@/components/detail/request-detail'

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <RequestDetail id={id} />
}
