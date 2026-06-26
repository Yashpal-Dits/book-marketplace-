
export const Loader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
    <div className="book-loader" aria-hidden="true">
      <span className="book-loader__side book-loader__side--left" />
      <span className="book-loader__side book-loader__side--right" />
      <span className="book-loader__page" />
      <span className="book-loader__page" />
      <span className="book-loader__page" />
    </div>
    <span className="text-sm font-semibold tracking-wide text-stone-500">{label}</span>
    <span className="sr-only">Loading content</span>
  </div>
)