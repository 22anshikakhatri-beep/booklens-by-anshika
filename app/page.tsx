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
  reason?: string;
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
          mode: qmode === "similar" ? "topic" : qmode,  // backend expects: topic | genre | description
          preferences,
        }),
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
    <main className="relative min-h-screen">
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/background.png" alt="" className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 vignette" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        {/* Title */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-[900] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)]">
            Book Burrow
          </h1>
        </header>

        {/* Search zone */}
        <section className="relative mx-auto max-w-3xl">
          {/* Mascot */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt="Bookish cat"
            className="hidden md:block absolute -left-24 -top-2 w-28 h-auto drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]"
          />

          {/* Tabs */}
          <div className="mb-3 flex justify-center gap-2">
            {([
              { key: "genre", label: "By Genre" },
              { key: "similar", label: "Similar To" },
              { key: "description", label: "Describe It" },
              { key: "topic", label: "Topic" },
            ] as { key: Mode; label: string }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                className={
                  "text-sm rounded-full px-3 py-1 transition " +
                  (mode === t.key
                    ? "bg-white/20 text-[color:var(--parchment)] border border-white/30"
                    : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/10")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pill search */}
          <div className="rounded-full p-2 pl-4 flex items-center gap-2"
               style={{ backgroundColor: "var(--coffee-800)", border: "1px solid rgba(255,255,255,.12)" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-[rgba(242,233,220,.75)] text-[color:var(--parchment)] py-2"
              style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}
            />
            {/* circular icon button at right end */}
            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="rounded-full h-9 w-9 grid place-items-center border border-white/30 hover:bg-white/20 disabled:opacity-60"
              aria-label="Search"
            >
              {/* search icon (inline svg so no deps) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[color:var(--parchment)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {GENRE_TAGS.map((g) => (
              <button
                key={g}
                onClick={() => { setMode("genre"); setText(g); runSearch(g, "genre"); }}
                className="chip"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Optional preferences */}
          <input
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="Optional preferences (audience, sub-themes, page count …)"
            className="mt-4 w-full rounded-xl bg-coffee-glass px-4 py-3 outline-none text-[color:var(--parchment)] placeholder:text-[rgba(242,233,220,.75)]"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          />
        </section>

        {/* Results */}
        <section className="mt-10">
          {!loading && items.length === 0 && (
            <p className="text-center text-[rgba(242,233,220,.85)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Try a genre, “similar to …”, or a description.
            </p>
          )}

          {/* warm brown skeletons while loading */}
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-3xl"
                     style={{ backgroundColor:"rgba(58,39,33,.78)", height:"160px" }} />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article key={`${b.title}-${i}`} className="card p-5 text-[color:var(--parchment)]">
                  {/* Title + byline */}
                  <h3 className="text-[22px] font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    {b.title}
                  </h3>
                  {b.author && (
                    <p className="mt-1 italic text-[rgba(242,233,220,.85)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      by {b.author}
                    </p>
                  )}

                  {/* Chips row */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && <span className="chip">{b.genre}</span>}
                    {typeof b.year === "number" && <span className="chip">{b.year}</span>}
                    {typeof b.pages === "number" && <span className="chip">{b.pages}p</span>}
                    {typeof b.rating === "number" && <span className="chip">★ {b.rating.toFixed(1)}</span>}
                  </div>

                  {/* Description */}
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed text-[rgba(242,233,220,.92)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
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
      {toast && (
        <div className="fixed bottom-5 right-5 rounded-xl px-4 py-3 text-[color:var(--parchment)] bg-[rgba(58,39,33,.78)] border border-[rgba(255,255,255,.08)]">
          {toast}
        </div>
      )}
    </main>
  );
}
