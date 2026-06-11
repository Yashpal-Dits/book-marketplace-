export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-10 text-center">
    <h3 className="font-serif text-2xl text-stone-900">{title}</h3>
    {description ? <p className="mt-2 text-sm text-stone-500">{description}</p> : null}
  </div>
)
