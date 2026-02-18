import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'

export default function HelloWorld() {
  const [count, setCount] = useState(0)

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hello World POC</h1>
        <p className="mt-2 text-muted-foreground">A minimal POC to use as a starting template.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Counter</h2>
        <p className="text-foreground">Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </section>
    </main>
  )
}
