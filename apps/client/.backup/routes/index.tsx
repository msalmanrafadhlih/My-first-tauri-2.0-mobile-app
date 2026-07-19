import { createFileRoute } from '@tanstack/react-router'
import { MessageScrollerDemo } from '@/components/chatLayout'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900">
      <MessageScrollerDemo />
    </div>
  )
}
