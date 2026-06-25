import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets the window scroll position to the top whenever the route (pathname)
 * changes. React Router does not do this automatically, which otherwise makes
 * a newly navigated page appear scrolled down (e.g. stuck near the footer),
 * most noticeably on mobile.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
