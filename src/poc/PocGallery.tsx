import { useNavigate } from '@tanstack/react-router'
import { POC_REGISTRY } from './index'
import { Card } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

export function PocGallery() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto max-w-[1400px] p-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground">POC Gallery</h1>
        <p className="mt-2 text-muted-foreground">Experimental features and proof-of-concept implementations</p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {POC_REGISTRY.map((poc) => (
          <Card
            key={poc.id}
            className="cursor-pointer p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            onClick={() => navigate({ to: poc.path as '/' })}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: poc.path as '/' })}
          >
            <h2 className="text-lg font-semibold text-foreground">{poc.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{poc.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {poc.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {POC_REGISTRY.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>No POCs available yet.</p>
        </div>
      )}
    </main>
  )
}
