import type { CommonAuthShellProps } from '@/interfaces'
import { Link } from 'react-router-dom'
import { FaBookOpen } from 'react-icons/fa'
import { FiCheckCircle } from 'react-icons/fi'

const content = {
  login: {
    headline: 'Find Your Next Great Read',
    subline:
      'Compare sellers, discover new books, and shop from trusted bookstores in just a few clicks.',
  },
  register: {
    headline: 'Start Your Reading Journey',
    subline:
      'Create your account and explore a warm marketplace filled with books from multiple sellers.',
  },
  seller: {
    headline: 'Open Your Digital Bookstore',
    subline:
      'Register as a seller, manage your catalog, control inventory, and fulfill book orders easily.',
  },
}

const highlights = [
  'Thousands of titles from trusted sellers',
  'Compare prices & pick the best deal',
  'Fast checkout and easy order tracking',
]

export const AuthShell = ({ children, mode }: CommonAuthShellProps) => {
  const copy = content[mode]

  return (
    <main className="min-h-screen bg-[#faf7ef] text-stone-900 lg:flex lg:items-center lg:justify-center lg:p-6">
      <div className="grid min-h-screen w-full max-w-6xl overflow-hidden bg-white shadow-[0_24px_80px_rgba(13,43,31,0.18)] lg:min-h-[640px] lg:rounded-[2.25rem] lg:grid-cols-2">
        {/* ── Brand panel (matches home hero theme) ───────────────────── */}
        <section className="relative hidden overflow-hidden bg-[#0d2b1f] text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          {/* decorative sparkles + glow, like the hero */}
          <span className="pointer-events-none absolute left-[14%] top-12 text-xl text-amber-400">✦</span>
          <span className="pointer-events-none absolute right-[18%] top-28 text-sm text-emerald-300">✦</span>
          <span className="pointer-events-none absolute bottom-28 left-[22%] text-sm text-orange-400">✦</span>
          <span className="pointer-events-none absolute bottom-40 right-[24%] text-xl text-amber-300">✦</span>
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f0532d]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          {/* logo */}
          <Link to="/" className="relative z-10 flex w-fit items-center gap-3 text-lg font-semibold">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#f0532d] shadow-lg">
              <FaBookOpen />
            </span>
            <span className="font-display text-xl tracking-wide text-emerald-300">Bseller</span>
          </Link>

          {/* headline */}
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Marketplace</p>
            <h2 className="font-display mt-4 text-4xl font-extrabold uppercase leading-[1.08] tracking-tight xl:text-[42px]">
              {copy.headline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-[#f5862e]">{copy.headline.split(' ').slice(-1)}</span>
            </h2>
            <p className="mt-5 max-w-[420px] text-[15px] leading-[1.75] text-white/75">{copy.subline}</p>

            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                  <FiCheckCircle className="shrink-0 text-[#f5862e]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* footer accent */}
          <div className="relative z-10 flex items-center gap-2" aria-hidden>
            <span className="h-1.5 w-12 rounded-full bg-[#f0532d]" />
            <span className="h-2 w-2 rounded-full bg-white/80" />
            <span className="h-2 w-2 rounded-full bg-white/50" />
          </div>
        </section>

        {/* ── Form panel ──────────────────────────────────────────────── */}
        <section className="flex flex-col bg-[#fffdf9]">
          {/* mobile brand bar (brand panel is hidden below lg) */}
          <header className="flex items-center justify-between border-b border-stone-100 bg-[#0d2b1f] px-5 py-4 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-semibold text-emerald-300">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#f0532d]">
                <FaBookOpen />
              </span>
              <span className="font-display text-lg tracking-wide">Bseller</span>
            </Link>
            <Link to="/" className="text-xs font-medium text-white/70 transition hover:text-[#f5862e]">
              ← Back to store
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 sm:py-10 lg:px-12">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
