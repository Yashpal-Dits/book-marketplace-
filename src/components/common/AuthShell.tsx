import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { FiBookOpen } from 'react-icons/fi'
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef3f4_0%,#f7efe3_45%,#e8edf0_100%)] px-4 py-6 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white/95 shadow-[0_24px_80px_rgba(80,70,55,0.16)] ring-1 ring-white/70 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-2">
        <section className="relative hidden min-h-[620px] overflow-hidden bg-[#efe7da] lg:block">
          <img
            src={bookstoreAuthBg}
            alt="Warm bookstore interior"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/55" />

          <div className="relative z-10 flex h-full min-h-[620px] flex-col justify-between p-10 text-white">
            <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 text-amber-900 shadow-lg">
                <FiBookOpen />
              </span>
              <span>Paper Haven</span>
            </Link>

            <div className="max-w-[460px] rounded-[1.5rem] bg-black/30 p-6 backdrop-blur-[2px]">
              <h2 className="font-serif text-[42px] font-semibold leading-[1.14] tracking-[-0.02em] text-white xl:text-[48px]">
                {copy.headline}
              </h2>

              <p className="mt-5 text-[16px] leading-[1.75] text-white/95">
                {copy.subline}
              </p>

              <div className="mt-8 flex items-center gap-2">
                <span className="h-1.5 w-12 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/80" />
                <span className="h-2 w-2 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center overflow-y-auto bg-[#fffdf9] px-6 py-8 sm:px-10 lg:min-h-[620px] lg:px-12">
          <div className="w-full max-w-md py-4">{children}</div>
        </section>
      </div>
    </main>
  )
}