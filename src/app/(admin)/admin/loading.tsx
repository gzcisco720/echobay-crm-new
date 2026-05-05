import React from 'react'

function Pulse({ className }: { className: string }): React.JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />
}

export default function AdminLoading(): React.JSX.Element {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-100 p-5">
            <Pulse className="w-9 h-9 mb-3" />
            <Pulse className="h-7 w-12 mb-1" />
            <Pulse className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-xl border border-zinc-100 p-5">
        <Pulse className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Pulse className="h-4 flex-1" />
              <Pulse className="h-4 w-24" />
              <Pulse className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
