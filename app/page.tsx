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
  const bubbleStyle = {
  background: "rgba(255, 255, 255, 0.65)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  boxShadow: "0 4px 30px rgba(255, 255, 255, 0.1)",
  maxWidth: "520px",
  fontSize: "18px",
  lineHeight: 1.4,
  color: "black",
};

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
          mode: mode === "similar" ? "topic" : mode,
          preferences: "",
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
    e.preventDefault();
    runSearch();
  }

  // Bubble copy (hidden while searching)
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

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* Title */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="heading-serif tracking-wider text-5xl md:text-6xl font-[900] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)]">
            Book Burrow
          </h1>
        </header>

        {/* Search */}
        <section className="relative mx-auto max-w-3xl">
          <form onSubmit={onSubmit} className="w-full">
            <div className="rounded-full p-3 pl-5 flex items-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.25)] border border-white/50">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label="Search"
                className="flex-1 bg-transparent outline-none text-black placeholder:text-black/50 text-lg font-sans py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full h-10 w-10 grid place-items-center border border-white/40 hover:bubbleStyle cursor-not-allowed"
                aria-label="Search"
                title="Search"
              >
                <span className="text-black text-lg">🔍︎</span>
              </button>
            </div>
          </form>

          {/* Mascot + Bubble */}
          <div className="relative mt-8 flex items-start gap-5 min-h-[160px]">
            <div className="shrink-0 w-[200px] md:w-[240px] lg:w-[260px] ml-6">
              <img
                src="/mascot.png"
                alt="Bookish cat"
                className="h-auto w-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
                style={{
  filter: "brightness(0.75) contrast(1.1) saturate(0.85)"
}}
              />
            </div>

            {bubble && (
              <div
                className="rounded-2xl px-5 py-4 text-black border flex-grow font-sans"
                style={{
                  background: "bubbleStyle",
                  borderColor: "rgba(0,0,0,.10)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  maxWidth: "520px",
                  fontSize: "18px",
                  lineHeight: 1.4,
                }}
              >
                {bubble}
              </div>
            )}
          </div>
        </section>

     {/* Results */}
<section className="mt-10">
  {loading && text.trim() !== "" && (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="rounded-3xl"
        style={{ backgroundColor: "rgba(255,255,255,0.75)", height: "160px" }}
      />
    ))}
  </div>
)}

  {!loading && items.length > 0 && (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((b, i) => (
        <article
          key={`${b.title}-${i}`}
          className="rounded-3xl border border-black/10 font-sans"
          style={{
            background: "bubbleStyle",
            padding: "20px",
            color: "black",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <h3 className="text-[22px] font-semibold">{b.title}</h3>
          {b.author && <p className="mt-1 italic text-black/70">by {b.author}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {b.genre && <span className="px-3 py-1 rounded-full border border-black/10 bg-black/10 text-sm">{b.genre}</span>}
            {typeof b.year === "number" && <span className="px-3 py-1 rounded-full border border-black/10 bg-black/10 text-sm">{b.year}</span>}
            {typeof b.pages === "number" && <span className="px-3 py-1 rounded-full border border-black/10 bg-black/10 text-sm">{b.pages}p</span>}
            {typeof b.rating === "number" && <span className="px-3 py-1 rounded-full border border-black/10 bg-black/10 text-sm">★ {b.rating.toFixed(1)}</span>}
          </div>
          {b.reason && <p className="mt-4 text-[15px] leading-relaxed text-black/80">{b.reason}</p>}
        </article>
      ))}
    </div>
  )}
</section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 rounded-xl px-4 py-3 text-black bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.1)] font-sans">
          {toast}
        </div>
      )}
    </main>
  );
}
