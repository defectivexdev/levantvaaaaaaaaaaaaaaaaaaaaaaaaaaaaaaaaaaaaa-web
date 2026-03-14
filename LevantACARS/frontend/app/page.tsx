'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import to avoid SSR issues with WebView2
const AcarsApp = dynamic(() => import('@/components/AcarsApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  ),
})

export default function Home() {
  return <AcarsApp />
}
