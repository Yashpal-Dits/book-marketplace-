import { Link } from 'react-router-dom'
import { FaBookOpen, FaCcAmex, FaCcApplePay, FaCcMastercard, FaCcPaypal, FaCcVisa } from 'react-icons/fa'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

interface FooterLink {
  label: string
  to?: string
}

interface FooterColumn {
  heading: string
  links: FooterLink[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Need Help?',
    links: [
      { label: 'Help Center' },
      { label: 'Shipping FAQs' },
      { label: 'Pick up in Store' },
      { label: 'Order Status', to: '/orders' },
      { label: 'Product Recalls' },
      { label: 'Corrections & Updates' },
      { label: 'Gift Cards' },
    ],
  },
  {
    heading: 'About Us',
    links: [
      { label: 'Contact Us' },
      { label: 'Track Your Order', to: '/orders' },
      { label: 'Returns Policy' },
      { label: 'Delivery Information' },
      { label: 'Loyalty Program' },
    ],
  },
  {
    heading: 'Categories',
    links: [
      { label: 'Coupons' },
      { label: 'Best Sellers', to: '/books' },
      { label: 'Scholarship Program' },
      { label: 'Brand Directory' },
      { label: 'E-Catalogs/Requests' },
      { label: 'Order Form', to: '/books' },
      { label: 'Blog' },
    ],
  },
]

const PAYMENT_ICONS = [
  { icon: FaCcMastercard, label: 'Mastercard' },
  { icon: FaCcApplePay, label: 'Apple Pay' },
  { icon: FaCcVisa, label: 'Visa' },
  { icon: FaCcAmex, label: 'American Express' },
  { icon: FaCcPaypal, label: 'PayPal' },
]

const SOCIAL_ICONS = [
  { icon: FiTwitter, label: 'Twitter' },
  { icon: FiInstagram, label: 'Instagram' },
  { icon: FiFacebook, label: 'Facebook' },
  { icon: FiYoutube, label: 'YouTube' },
]

export const Footer = () => (
  <footer className="bg-[#0d2b1f] text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {FOOTER_COLUMNS.map((column) => (
        <nav key={column.heading} aria-label={column.heading}>
          <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white">{column.heading}</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            {column.links.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link to={link.to} className="transition hover:text-emerald-300">
                    {link.label}
                  </Link>
                ) : (
                  <span className="cursor-default transition hover:text-emerald-300">{link.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ))}

      {/* payment + social */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white">Payment & Contact</h4>
        <p className="mt-4 text-sm text-white/60">Sign up for our latest news and offers:</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
          {PAYMENT_ICONS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              title={label}
              className="inline-flex h-9 w-12 items-center justify-center rounded-md bg-white text-2xl text-stone-700"
            >
              <Icon aria-label={label} />
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3" aria-label="Social media">
          {SOCIAL_ICONS.map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-emerald-300 hover:text-emerald-300"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* bottom bar */}
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <span className="cursor-default transition hover:text-emerald-300">Terms of Use</span>
          <span className="cursor-default transition hover:text-emerald-300">Copyright & Trademark</span>
          <span className="cursor-default transition hover:text-emerald-300">Policy</span>
          <span className="cursor-default transition hover:text-emerald-300">Sitemap</span>
        </div>
        <p className="flex items-center gap-2">
          <FaBookOpen className="text-[#f5862e]" />
          © 2026 Bseller. All Rights Reserved
        </p>
      </div>
    </div>
  </footer>
)
