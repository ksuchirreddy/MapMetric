import React from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
  variant?: 'spatial' | 'boxed';
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found.',
  isLoading = false,
  className,
  variant = 'spatial',
}: TableProps<T>) {
  const isSpatial = variant === 'spatial';

  return (
    <div className={cn(
      'overflow-x-auto w-full transition-all duration-300',
      isSpatial ? 'bg-transparent border-0 shadow-none' : 'border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md',
      className
    )}>
      <table className="w-full text-left text-sm text-gray-200 border-collapse">
        <thead className={cn(
          'text-xs uppercase font-mono tracking-widest text-gray-400 border-b border-white/10',
          isSpatial ? 'bg-transparent' : 'bg-white/5'
        )}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('px-4 py-4 font-semibold text-[11px]', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-sans">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse border-b border-white/5">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 bg-white/10 rounded-md w-2/3"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 font-mono text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  'group transition-all duration-200 border-b border-white/5 relative',
                  'hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-2xl transform-gpu',
                  onRowClick ? 'cursor-pointer' : ''
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-4 font-sans text-xs text-gray-200 group-hover:text-white transition-colors', col.className)}>
                    {col.render ? col.render(item, index) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
