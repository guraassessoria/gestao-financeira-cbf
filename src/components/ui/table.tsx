import { cn } from '@/lib/utils'

interface TableProps {
  className?: string
  children: React.ReactNode
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ className, children }: TableProps) {
  return <thead className={cn('', className)}>{children}</thead>
}

export function TableBody({ className, children }: TableProps) {
  return <tbody className={cn('', className)}>{children}</tbody>
}

export function TableRow({ className, children }: TableProps) {
  return (
    <tr className={cn('border-b border-slate-100 hover:bg-slate-50 transition-colors', className)}>
      {children}
    </tr>
  )
}

export function TableHead({ className, children }: TableProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children }: TableProps) {
  return (
    <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>
  )
}
