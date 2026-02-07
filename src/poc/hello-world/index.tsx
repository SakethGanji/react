import { useState } from 'react'

export default function HelloWorld() {
  const [count, setCount] = useState(0)

  return (
    <main className="poc-content">
      <h1>Hello World POC</h1>
      <p>A minimal POC to use as a starting template.</p>

      <section className="poc-section">
        <h2>Counter</h2>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </section>
    </main>
  )
}
