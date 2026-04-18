import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/test/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className="auth-card">
      <h1 className="auth-title">Test Page</h1>
      <p className="auth-subtitle">Button clicks: {clickCount}</p>
      <button
        type="button"
        className="auth-btn"
        onClick={() => {
          const next = clickCount + 1
          setClickCount(next)
          console.log('Test button clicked', { clickCount: next })
        }}
      >
        Test Button
      </button>
    </div>
  )
}
