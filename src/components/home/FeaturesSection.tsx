import type { IconType } from 'react-icons'
import { FiBookOpen, FiTag, FiTruck } from 'react-icons/fi'

interface Feature {
  icon: IconType
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: FiTruck,
    title: 'Free Standard Delivery',
    description: 'Enjoy free standard delivery on every order — your next great read ships at no extra cost.',
  },
  {
    icon: FiBookOpen,
    title: '2 Million Books Availability',
    description: 'From timeless classics to new releases, explore a catalog of over two million titles.',
  },
  {
    icon: FiTag,
    title: 'Special Discount',
    description: 'Weekly deals and seasonal offers from multiple sellers so you always get the best price.',
  },
]

export const FeaturesSection = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="grid gap-10 sm:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex flex-col items-center text-center">
          <span className="relative inline-flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-full bg-[#9ee0cf]" aria-hidden />
            <Icon className="relative text-3xl text-[#16243d]" />
          </span>
          <h3 className="font-display mt-5 text-lg font-extrabold uppercase tracking-wide text-[#16243d]">{title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">{description}</p>
        </div>
      ))}
    </div>
  </section>
)
