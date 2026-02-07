import { useState } from 'react'

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
    <main className="poc-content">
      <h1>API Test POC</h1>
      <p>Test API calls against any endpoint.</p>

      <section className="poc-section">
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        {data && <pre style={{ marginTop: '1rem' }}>{data}</pre>}
      </section>
    </main>
  )
}
