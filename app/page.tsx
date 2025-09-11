"use client";

import { useEffect, useState } from "react";

/** Minimal types for your API response */
type Book = {
  title: string;
  author: string;
  genre?: string;
  year?: number;
  pages?: number;
  rating?: number;
  reason?: string; // “why this” / description
};

export default function Home() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  async function runSearch() {
    const q = text.trim();
    if (!q) {
      setToast("Please type something first.");
      return;
    }
    setLoading(true);
    setItems([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend supports: mode: topic | genre | description
        // we always send topic since user will type anything here
        body: JSON.stringify({ text: q, mode: "topic", preferences: "" }),
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
      <img
        src="/background.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Vignette */}
      <div className="absolute inset-0 vignette" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10">
        {/* Title */}
        <header className="text-center mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-[900] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)]">
            Book Burrow
          </h1>
        </header>

        {/* Search only (no tabs, no chips, no secondary input) */}
        <section className="relative mx-auto max-w-3xl">
          {/* Mascot on the left of the pill */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt="Bookish cat"
            className="hidden md:block absolute -left-24 -top-6 w-28 h-auto drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)]"
          />

          {/* Pill search */}
          <div className="bg-coffee-glass rounded-full p-2 pl-4 flex items-center gap-2">
            <input
              value={text}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              onChange={(e) => setText(e.target.value)}
              placeholder="strategy and gaming"
              className="flex-1 bg-transparent outline-none placeholder:text-[rgba(242,233,220,.75)] text-[color:var(--parchment)] py-2"
              style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "17px" }}
            />
            {/* circular icon button at right end */}
            <button
              onClick={runSearch}
              disabled={loading}
              className="rounded-full h-10 w-10 grid place-items-center border border-white/30 hover:bg-white/20 disabled:opacity-60"
              aria-label="Search"
              title="Search"
            >
              {/* search icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[color:var(--parchment)]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </section>

        {/* Results */}
        <section className="mt-10">
          {!loading && items.length === 0 && (
            <p
              className="text-center text-[rgba(242,233,220,.88)]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Type a prompt above (e.g., “cozy romantic comedy with rivals who become friends”).
            </p>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-[22px]" style={{ backgroundColor: "rgba(58,39,33,.78)", height: 160 }} />
              ))}
            </div>
          )}

          {/* Cards */}
          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article key={`${b.title}-${i}`} className="card p-5 text-[color:var(--parchment)]">
                  {/* Title & byline */}
                  <h3 className="text-[22px] font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    {b.title}
                  </h3>
                  {b.author && (
                    <p className="mt-1 italic text-[rgba(242,233,220,.88)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      by {b.author}
                    </p>
                  )}

                  {/* Small chips row, like the reference */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && <span className="chip">{b.genre}</span>}
                    {typeof b.year === "number" && <span className="chip">{b.year}</span>}
                    {typeof b.pages === "number" && <span className="chip">{b.pages}p</span>}
                    {typeof b.rating === "number" && <span className="chip">★ {b.rating.toFixed(1)}</span>}
                  </div>

                  {/* Description / why this */}
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed text-[rgba(242,233,220,.95)]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
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
