import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search features, layers, CRS...',
  containerClassName,
  className,
  ...props
}) => {
  return (
    <div className={cn('relative flex items-center', containerClassName)}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full bg-slate-900/90 text-slate-200 text-xs rounded-lg pl-9 pr-8 py-2 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-500 font-sans',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 text-slate-500 hover:text-slate-300 p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
