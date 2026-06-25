import type { IconType } from 'react-icons'

export interface HomeFeature {
  icon: IconType
  title: string
  description: string
}

export interface HomeHeroSearchValues {
  search: string
  category: string
}

export interface HomeAuthorSummary {
  name: string
  booksCount: number
  rating: number
  initials: string
  colorClass: string
  image?: string
}
