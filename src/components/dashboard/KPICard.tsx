interface KPICardProps {
  title: string
  value: string
  change: number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'amber'
}

const colorStyles = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  red: 'bg-red-50 border-red-200',
  amber: 'bg-amber-50 border-amber-200',
}

const changeColorStyles = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
  amber: 'text-amber-600',
}

export function KPICard({
  title,
  value,
  change,
  icon,
  color = 'blue',
}: KPICardProps) {
  const isPositive = change >= 0

  return (
    <div className={`rounded-lg border ${colorStyles[color]} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-3">{value}</p>
          <p
            className={`text-sm mt-2 font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}{change}%
          </p>
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  )
}

interface KPIGridProps {
  children: React.ReactNode
}

export function KPIGrid({ children }: KPIGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  )
}
