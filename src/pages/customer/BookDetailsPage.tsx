import { useParams } from 'react-router-dom'

export const BookDetailsPage = () => {
  const { id } = useParams()
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-serif text-5xl text-stone-950">Book details</h1>
      <p className="mt-3 text-stone-600">
        Details for book <span className="font-semibold">{id}</span> will be built next (seller
        comparison, add to cart).
      </p>
    </section>
  )
}
