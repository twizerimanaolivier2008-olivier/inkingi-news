import { useState } from 'react'

const skeletonCard = (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-5 bg-gray-200 rounded w-full" />
      <div className="h-5 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
)

const skeletonCompact = (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-row">
    <div className="w-24 h-16 bg-gray-200 shrink-0" />
    <div className="p-3 flex-1 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
)

export function ArticleSkeleton({ count = 6, variant = 'default' }) {
  const items = Array.from({ length: count })
  const render = () => {
    if (variant === 'compact') return items.map((_, i) => <div key={i}>{skeletonCompact}</div>)
    return items.map((_, i) => <div key={i}>{skeletonCard}</div>)
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{render()}</div>
}

export function FeaturedSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-col md:flex-row">
      <div className="md:w-1/2 h-48 md:h-auto bg-gray-200" />
      <div className="p-6 flex-1 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}
