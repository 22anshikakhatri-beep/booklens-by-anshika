// app/page.tsx
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

export default function Home() {
  const [mode, setMode] = useState<Mode>("topic");
  const [text, setText] = useState("");
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Your single, precise placeholder (as in your reference image)
  const placeholder = useMemo(
    () => "Search a topic, genre, or similar to books you have read",
    []
  );

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  async function runSearch() {
    const qtext = text.trim();
    if (!qtext) {
      setToast("Please type something first.");
      return;
    }
    setLoading(true);
    setItems([]);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: mode === "similar" ? `Books similar to ${qtext}` : qtext,
          mode: mode === "similar" ? "topic" : mode, // backend expects: topic | genre | description
          preferences: "", // we removed extra inputs
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // ENTER submits
    runSearch();
  }

  // Bubble copy per state
  const bubble =
    loading && text
      ? "Ok, go be busy for 15 sec while I find you books…"
      : items.length > 0
      ? "There you go!"
      : "What do you want to read today?";

  return (
    <main className="relative min-h-screen">
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/background.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 vignette" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10">
        {/* Title */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-[900] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)]">
            Book Burrow
          </h1>
        </header>

        {/* Search */}
        <section className="relative mx-auto max-w-3xl">
          <form onSubmit={onSubmit} className="w-full">
            <div className="bg-coffee-glass rounded-full p-2 pl-4 flex items-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.25)] border border-white/20">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label="Search"
                className="flex-1 bg-transparent outline-none placeholder:text-[rgba(242,233,220,.75)] text-[color:var(--parchment)] py-2"
                style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full h-10 w-10 grid place-items-center border border-white/30 hover:bg-white/20 disabled:opacity-60"
                aria-label="Search"
                title="Search"
              >
                {/* simple magnifier glyph */}
                <span className="text-[color:var(--parchment)] text-lg">🔍︎</span>
              </button>
            </div>
          </form>

          {/* Mascot + Bubble row (anchored to search, NOT centered) */}
         <div className="relative mt-8 flex items-start gap-5">
            {/* Fixed-width mascot so bubble anchors to its right */}
            <div className="shrink-0 w-[260px] md:w-[300px] lg:w-[320px]">
              <img
                src="/mascot.png"
                alt="Bookish cat"
                className="h-auto w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
              />
            </div>

            {/* Speech bubble grows to the right */}
            <div
              className="rounded-2xl px-5 py-4 text-[color:var(--parchment)] border flex-grow"
              style={{
                background: "rgba(58,39,33,.78)",
                borderColor: "rgba(255,255,255,.10)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                maxWidth: "520px",
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "17px",
                lineHeight: 1.35,
              }}
            >
              {bubble}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mt-10">
          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl"
                  style={{ backgroundColor: "rgba(58,39,33,.78)", height: "160px" }}
                />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article
                  key={`${b.title}-${i}`}
                  className="rounded-3xl border border-white/10"
                  style={{
                    background: "rgba(58,39,33,.78)",
                    padding: "20px",
                    color: "var(--parchment)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                  }}
                >
                  <h3
                    className="text-[22px] font-semibold"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {b.title}
                  </h3>
                  {b.author && (
                    <p
                      className="mt-1 italic text-[rgba(242,233,220,.85)]"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      by {b.author}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-sm">
                        {b.genre}
                      </span>
                    )}
                    {typeof b.year === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-sm">
                        {b.year}
                      </span>
                    )}
                    {typeof b.pages === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-sm">
                        {b.pages}p
                      </span>
                    )}
                    {typeof b.rating === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-sm">
                        ★ {b.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {b.reason && (
                    <p
                      className="mt-4 text-[15px] leading-relaxed text-[rgba(242,233,220,.92)]"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      {b.reason}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <p
              className="text-center text-[rgba(242,233,220,.85)]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {/* intentionally blank to match your design (no extra helper text) */}
            </p>
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
