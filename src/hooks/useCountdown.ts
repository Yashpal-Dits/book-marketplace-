import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

const calculate = (target: string): Countdown => {
  const diff = new Date(target).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
  }
}

/** Live countdown to a target ISO date, updating every second. */
export const useCountdown = (targetDate: string): Countdown => {
  const [countdown, setCountdown] = useState<Countdown>(() => calculate(targetDate))

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(calculate(targetDate)), 1000)
    return () => window.clearInterval(timer)
  }, [targetDate])

  return countdown
}
