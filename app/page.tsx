'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatShell from '@/components/chat-shell'

export default function Home() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('tigo_user')
    if (!user) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) return null
  return <ChatShell />
}
