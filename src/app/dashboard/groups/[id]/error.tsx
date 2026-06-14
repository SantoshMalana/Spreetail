'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Captured by Error Boundary:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-red-500 mb-4">A Runtime Error Occurred!</h2>
        <p className="text-gray-300 mb-4">Please screenshot this box and send it to me so I can fix it immediately:</p>
        
        <div className="bg-black/50 p-4 rounded-xl overflow-x-auto mb-6">
          <p className="text-red-400 font-mono text-sm font-bold mb-2">{error.message}</p>
          <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
            {error.stack}
          </pre>
        </div>

        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
