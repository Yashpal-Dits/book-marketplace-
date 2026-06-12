import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { FaBookOpen } from 'react-icons/fa'
import bookstoreAuthBg from '@/assets/bookstore-auth-bg.svg'

interface AuthShellProps extends PropsWithChildren {
  mode: 'login' | 'register' | 'seller'
}

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

export const AuthShell = ({ children, mode }: AuthShellProps) => {
  const copy = content[mode]

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef3f4_0%,#f7efe3_45%,#e8edf0_100%)] text-stone-900 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl overflow-hidden bg-white/95 shadow-[0_24px_80px_rgba(80,70,55,0.16)] ring-1 ring-white/70 sm:min-h-0 sm:rounded-[2rem] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2">
        {/* image panel — hidden below lg */}
        <section className="relative hidden overflow-hidden bg-[#efe7da] lg:block">
          <img
            src={bookstoreAuthBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/55" />

          <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-between p-8 text-white xl:p-10">
            <Link to="/" className="flex w-fit items-center gap-3 text-lg font-semibold">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#f0532d] shadow-lg">
                <FaBookOpen />
              </span>
              <span className="font-display tracking-wide">Bseller</span>
            </Link>

            <div className="max-w-[460px] rounded-[1.5rem] bg-black/30 p-6 backdrop-blur-[2px]">
              <h2 className="font-display text-4xl font-extrabold uppercase leading-[1.1] tracking-tight text-white xl:text-[44px]">
                {copy.headline}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-white/95">{copy.subline}</p>
              <div className="mt-8 flex items-center gap-2" aria-hidden>
                <span className="h-1.5 w-12 rounded-full bg-[#f0532d]" />
                <span className="h-2 w-2 rounded-full bg-white/80" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </section>

        {/* form panel */}
        <section className="flex flex-col bg-[#fffdf9]">
          {/* mobile-only brand bar (image panel is hidden below lg) */}
          <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-semibold text-[#0d2b1f]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0d2b1f] text-sm text-[#f5862e]">
                <FaBookOpen />
              </span>
              <span className="font-display text-lg tracking-wide">Bseller</span>
            </Link>
            <Link to="/" className="text-xs font-medium text-stone-500 hover:text-[#f0532d]">
              ← Back to store
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:px-12">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </section>
      </div>
    </main>
  )
}
