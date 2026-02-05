import { useNavigate } from '@tanstack/react-router'
import { POC_REGISTRY } from './index'

export function PocGallery() {
  const navigate = useNavigate()

  return (
    <main className="poc-gallery">
      <header className="poc-gallery-header">
        <h1>POC Gallery</h1>
        <p>Experimental features and proof-of-concept implementations</p>
      </header>

      <div className="poc-gallery-grid">
        {POC_REGISTRY.map((poc) => (
          <div
            key={poc.id}
            className="poc-card"
            onClick={() => navigate({ to: poc.path as '/' })}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate({ to: poc.path as '/' })}
          >
            <h2 className="poc-card-title">{poc.name}</h2>
            <p className="poc-card-description">{poc.description}</p>
            <div className="poc-card-tags">
              {poc.tags.map((tag) => (
                <span key={tag} className="poc-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {POC_REGISTRY.length === 0 && (
        <div className="poc-empty">
          <p>No POCs available yet.</p>
        </div>
      )}
    </main>
  )
}
