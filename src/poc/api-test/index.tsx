import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'

export default function ApiTest() {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
      const json = await res.json()
      setData(JSON.stringify(json, null, 2))
    } catch (err) {
      setData('Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-[1400px] space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Test POC</h1>
        <p className="mt-2 text-muted-foreground">Test API calls against any endpoint.</p>
      </div>

      <section className="space-y-4">
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </Button>
        {data && <pre className="mt-4 rounded-md bg-muted p-4 text-sm">{data}</pre>}
      </section>
    </main>
  )
}
