import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export const UnauthorizedPage = () => <section className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="font-serif text-5xl text-stone-950">Unauthorized</h1><p className="mt-3 text-stone-600">You do not have permission to access this page.</p><Link to="/"><Button className="mt-6">Go home</Button></Link></section>
