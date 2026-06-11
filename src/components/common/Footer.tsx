import { FiBookOpen, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'

export const Footer = () => (
  <footer className="mt-16 border-t border-stone-200 bg-[#eee7d8]">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 font-serif text-lg font-semibold text-amber-900"><FiBookOpen /> Paper Haven</div>
        <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">A multi-seller book marketplace where customers compare sellers and buy books from the best listing.</p>
        <div className="mt-4 flex gap-3 text-stone-500"><FiInstagram /><FiTwitter /><FiFacebook /></div>
      </div>
      <div>
        <h4 className="font-medium text-stone-900">Explore</h4>
        <ul className="mt-3 space-y-2 text-sm text-stone-600"><li>Books</li><li>Categories</li><li>Best sellers</li></ul>
      </div>
      <div>
        <h4 className="font-medium text-stone-900">Marketplace</h4>
        <ul className="mt-3 space-y-2 text-sm text-stone-600"><li>Seller portal</li><li>Admin portal</li><li>Support</li></ul>
      </div>
    </div>
    <div className="border-t border-stone-300 py-4 text-center text-xs text-stone-500">Copyright © 2026 Paper Haven. All rights reserved.</div>
  </footer>
)
