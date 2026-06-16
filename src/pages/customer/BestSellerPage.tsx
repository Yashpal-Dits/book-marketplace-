import { BestSellersSection } from '@/components/home/BestSellersSection'

export const BestSellersPage = () => (
  <>
    <section className="bg-[#0d2b1f] py-12 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Trending Now</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold uppercase sm:text-5xl">
        Best <span className="text-[#f5862e]">Sellers</span>
      </h1>
      <p className="mx-auto mt-3 max-w-md px-4 text-sm leading-6 text-emerald-100/70">
        The books everyone is reading, loving, and recommending right now.
      </p>
    </section>
    <BestSellersSection />
  </>
)
