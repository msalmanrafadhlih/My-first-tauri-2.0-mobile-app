import { useState } from 'react'
import { sendChatMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function BtnConnect() {
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTest() {
    setLoading(true)
    try {
      const res = await sendChatMessage('Halo!')
      setReply(res.reply)
    } catch (err) {
      setReply(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 self-center">
      <Button onClick={handleTest} disabled={loading}>
        {loading ? 'Sending Message...' : 'Test Conection'}
      </Button>
      {reply && <p className="mt-4">{reply}</p>}
    </div>
  )
}
