import { useEffect, useState } from 'react'
import './App.css'

interface Item {
  title: string
  price: string
  note: string
  images: string[]
}

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSvIBnAIEajtVl_JmOGahJ0N6OAqEoTVQVnkByMN68FPLeEnX4guZLZudYcVZAnKIMugszJqRTAm-bD/pub?output=csv'

function parseCSV(csv: string): Item[] {
  const [, ...rows] = csv.trim().split('\n')
  return rows
    .map((row) => {
      const cols = row.split(',').map((c) => c.trim())
      const [title, price, note, image1, image2] = cols
      if (!title) return null
      const images = [image1, image2].filter(Boolean)
      return { title, price, note, images }
    })
    .filter((item): item is Item => item !== null)
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(SHEET_URL)
      .then((r) => r.text())
      .then((csv) => setItems(parseCSV(csv)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="catalogue">
      <h1>Venta por mudanza</h1>
      <p className="subtitle">Consultar disponibilidad al 3512301908</p>

      {loading ? (
        <p style={{ color: '#a1a1a1', marginTop: 40, textAlign: 'center' }}>
          Cargando...
        </p>
      ) : items.length === 0 ? (
        <p style={{ color: '#a1a1a1', marginTop: 40, textAlign: 'center' }}>
          No hay artículos publicados todavía.
        </p>
      ) : (
        <div className="grid">
          {items.map((item, i) => (
            <div className="card" key={i}>
              {item.images.length > 0 && (
                <div className={`card-images${item.images.length > 1 ? ' two' : ''}`}>
                  {item.images.map((src, j) => (
                    <img key={j} src={src} alt={item.title} />
                  ))}
                </div>
              )}
              <div className="card-body">
                <h2>{item.title}</h2>
                <p className="price">{item.price}</p>
                {item.note && <p className="note">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
