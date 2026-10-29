const style = `
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-ticker {
  animation: ticker 30s linear infinite;
}
`

export default function NewsTicker({ items }) {
  const defaultItems = [
    'Latest Updates',
    'Government announces new investment in Kigali',
    'African Union holds summit in Addis Ababa',
    'Rwandan tech startup raises Series A funding',
    'Sports: APR FC advances to quarter-finals',
    'New trade deal signed between East African nations',
    'Kigali Innovation City project reaches new milestone',
  ]

  const tickerItems = items && items.length > 0 ? items : defaultItems

  const duplicated = [...tickerItems, ...tickerItems]

  return (
    <div className="bg-[#D72638] text-white text-sm font-medium overflow-hidden relative">
      <style>{style}</style>
      <div className="animate-ticker flex items-center whitespace-nowrap py-2">
        <span className="bg-[#a81e2b] text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mr-4 shrink-0">
          BREAKING
        </span>
        {duplicated.map((item, i) => (
          <span key={i} className="mx-6">
            {item}
            <span className="mx-4 opacity-50">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
