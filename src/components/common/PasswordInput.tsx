import { useState, type InputHTMLAttributes } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/cn'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

/** Password field with a working show/hide toggle, styled like FormInput. */
export const PasswordInput = ({ label, error, className, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          className={cn(
            'h-11 w-full rounded-xl border border-stone-200 bg-white px-4 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-500/10',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          onClick={() => setIsVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:text-stone-700"
        >
          {isVisible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
