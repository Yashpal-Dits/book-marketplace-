import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormInput = ({ label, error, className, ...props }: FormInputProps) => (
  <label className="block text-left">
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
        className,
      )}
      {...props}
    />
    {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
  </label>
)
