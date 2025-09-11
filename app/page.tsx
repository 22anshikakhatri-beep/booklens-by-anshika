"use client";

import { useEffect, useMemo, useState } from "react";

type Mode = "genre" | "similar" | "description" | "topic";
type Book = {
  title: string;
  author: string;
  genre?: string;
  year?: number;
  pages?: number;
  rating?: number;
  reason?: string; // description/why-this
};

const GENRE_TAGS = [
  "Fiction","Mystery","Romance","Sci-Fi","Fantasy",
  "Thriller","Biography","History","Self-Help","Literary"
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("topic");
  const [text, setText] = useState("");
  const [preferences, setPreferences] = useState("");
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    if (mode === "genre") return "Enter a genre, e.g., Romantic Comedy, Biography…";
    if (mode === "similar") return "“Similar to The Hating Game” or “like Dune”…";
    if (mode === "description") return "Describe the vibe: cozy, rivals-to-lovers, fast-paced…";
    return "Topic or theme, e.g., strategy & gaming, tragicomedy about millennial life";
  }, [mode]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  async function runSearch(q?: string, m?: Mode) {
    const qtext = (q ?? text).trim();
    const qmode = m ?? mode;
    if (!qtext) { setToast("Please type something first."); return; }
    setLoading(true);
    setItems([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: qmode === "similar" ? `Books similar to ${qtext}` : qtext,
          mode: qmode === "similar" ? "topic" : qmode, // backend modes: topic | genre | description
          preferences
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setItems(data.items || []);
      setToast(`Found ${data.items?.length ?? 0} recommendations`);
    } catch (e: any) {
      setToast(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <img
        src="/backrground.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Soft vignette overlay */}
      <div className="vignette" />

      {/* Content wrapper */}
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10">
        {/* Title */}
        <header className="text-center mb-8">
          <h1 className="heading-serif text-[46px] md:text-[64px] font-bold">Book Burrow</h1>
        </header>

        {/* Search zone */}
        <section className="relative mx-auto max-w-3xl">
          {/* Mascot (left of the search) */}
          <img
            src="/Gemini_Generated_Image_c1mttwc1mttwc1mt-removebg-preview.png"
            alt="Bookish cat"
            className="hidden md:block absolute -left-24 -top-8 w-28 h-auto"
          />

          {/* Mode tabs */}
          <div className="mb-3 flex justify-center gap-2">
            {([
              { key: "genre", label: "By Genre" },
              { key: "similar", label: "Similar To" },
              { key: "description", label: "Describe It" },
              { key: "topic", label: "Topic" }
            ] as { key: Mode; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                className={`chip ${mode === t.key ? "outline outline-1 outline-white/40" : ""}`}
                style={{ borderRadius: "9999px" }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search bar (glassy pill) */}
          <div className="bg-coffee-glass flex items-center gap-2 p-2 pl-4">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={placeholder}
              className="glass-input placeholder:opacity-70"
            />
            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="glass-button"
              aria-label="Search"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Quick genre chips */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {GENRE_TAGS.map(g => (
              <button
                key={g}
                onClick={() => { setMode("genre"); setText(g); runSearch(g, "genre"); }}
                className="chip"
              >
                {g}
              </button>
            ))}
          </div>

          {/* Optional preferences */}
          <input
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
            placeholder="Optional preferences (audience, sub-themes, page count …)"
            className="mt-4 w-full glass-input bg-coffee-glass rounded-[18px]"
          />
        </section>

        {/* Results */}
        <section className="mt-10">
          {!loading && items.length === 0 && (
            <p className="text-center opacity-90">
              Try a genre, “similar to …”, or a description.
            </p>
          )}

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card h-40 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article key={`${b.title}-${i}`} className="card p-5">
                  {/* Title & byline */}
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  {b.author && <p className="mt-0.5 opacity-90 italic">by {b.author}</p>}

                  {/* Tag row */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && <span className="chip">{b.genre}</span>}
                    {typeof b.year === "number" && <span className="chip">{b.year}</span>}
                    {typeof b.pages === "number" && <span className="chip">{b.pages}p</span>}
                    {typeof b.rating === "number" && <span className="chip">★ {b.rating.toFixed(1)}</span>}
                  </div>

                  {/* Why this book */}
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed">
                      {b.reason}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
