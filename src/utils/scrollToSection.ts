export const EXPLORE_BOOKS_SECTION_ID = 'explore-books'

export const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
