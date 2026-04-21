import { useEffect, useState } from "react";
import "./App.css";

interface Item {
  title: string;
  price: string;
  note: string;
  images: string[];
  sold: boolean;
  reserved: boolean;
}

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvIBnAIEajtVl_JmOGahJ0N6OAqEoTVQVnkByMN68FPLeEnX4guZLZudYcVZAnKIMugszJqRTAm-bD/pub?output=csv";

function driveToDirectUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  return url;
}

function parseCSV(csv: string): Item[] {
  const [, ...rows] = csv.trim().split("\n");
  return rows
    .map((row) => {
      const cols = row.split(",").map((c) => c.trim());
      const [title, price, note, image1, image2, status, , , hidden] = cols;
      if (!title || hidden?.toLowerCase() === "true") return null;
      const images = [image1, image2].filter(Boolean).map(driveToDirectUrl);
      const sold = status?.toLowerCase() === "vendido";
      const reserved = status?.toLowerCase() === "reservado";
      return { title, price, note, images, sold, reserved };
    })
    .filter((item): item is Item => item !== null);
}

function Lightbox({
  images,
  onClose,
}: {
  images: string[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight")
        setIndex((i) => (i < images.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lb-close" onClick={onClose}>&#x2715;</button>
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <>
          <button
            className="lb-prev"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i - 1);
            }}
          >
            ‹
          </button>
          <button
            className="lb-next"
            disabled={index === images.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i + 1);
            }}
          >
            ›
          </button>
          <div className="lb-dots">
            {images.map((_, j) => (
              <span
                key={j}
                className={`lb-dot${j === index ? " active" : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string[] | null>(null);

  useEffect(() => {
    fetch(SHEET_URL)
      .then((r) => r.text())
      .then((csv) => setItems(parseCSV(csv)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="catalogue">
      <h1>Venta por mudanza</h1>

      {loading ? (
        <p style={{ color: "#a1a1a1", marginTop: 40, textAlign: "center" }}>
          Cargando...
        </p>
      ) : items.length === 0 ? (
        <p style={{ color: "#a1a1a1", marginTop: 40, textAlign: "center" }}>
          No hay artículos publicados todavía.
        </p>
      ) : (
        <div className="grid">
          {[...items].sort((a, b) => Number(a.reserved) + Number(a.sold) * 2 - (Number(b.reserved) + Number(b.sold) * 2)).map((item, i) => (
            <div
              className={`card${item.sold ? " sold" : ""}${item.reserved ? " reserved" : ""}`}
              key={i}
              onClick={() => item.images.length > 0 && setLightbox(item.images)}
            >
              {item.images.length > 0 && (
                <div
                  className={`card-images${item.images.length > 1 ? " two" : ""}`}
                >
                  {item.images.map((src, j) => (
                    <img key={j} src={src} alt={item.title} />
                  ))}
                </div>
              )}
              {item.sold && <span className="sold-badge">Vendido</span>}
              {item.reserved && <span className="reserved-badge">Reservado</span>}
              <div className="card-body">
                <h2>{item.title}</h2>
                <p className="price">{item.price}</p>
                {item.note && <p className="note">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox images={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

export default App;
