import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

/**
 * Segmented numeric OTP input (default 6 boxes) with auto-advance, backspace
 * navigation, and full-code paste support. The combined code is reported as a
 * single string through `onChange`.
 */
export const OtpInput = ({ length = 6, value, onChange, disabled = false, hasError = false }: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focusIndex = (index: number) => {
    const el = inputsRef.current[index]
    if (el) el.focus()
  }

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice()
    next[index] = digit
    onChange(next.join('').slice(0, length))
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1) // keep only the last typed number
    if (!digit) {
      setDigit(index, '')
      return
    }
    setDigit(index, digit)
    if (index < length - 1) focusIndex(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        setDigit(index, '')
      } else if (index > 0) {
        focusIndex(index - 1)
        setDigit(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusIndex(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3" role="group" aria-label="One-time password">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-12 w-full rounded-xl border bg-white text-center text-lg font-bold text-stone-900 outline-none transition focus:ring-4 sm:h-14 sm:text-xl',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
              : 'border-stone-200 focus:border-[#f0532d] focus:ring-orange-500/10',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        />
      ))}
    </div>
  )
}
