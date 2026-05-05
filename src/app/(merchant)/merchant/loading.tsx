import React from 'react'

function Pulse({ className }: { className: string }): React.JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />
}

export default function MerchantLoading(): React.JSX.Element {
  return (
    <div className="w-full flex flex-col gap-5">
      {/* Primary content card */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Pulse className="h-3 w-20 mb-1.5" />
              <Pulse className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary card */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-28 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Pulse key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
