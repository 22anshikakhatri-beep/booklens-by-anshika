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

  // CHANGE: unify bubble style (dark glass + white text for contrast)
  const bubbleStyle = {
    background: "rgba(34, 24, 18, 0.78)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
    color: "#ffffff",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    maxWidth: "520px",
    fontSize: "18px",
    lineHeight: 1.4,
  } as const;

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

  const bubble =
    loading && text
      ? "Ok, go be busy for 15 sec while I find you booksâ€¦"
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
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover object-top" // CHANGE: anchor to top
      />
      <div className="absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24">
        {/* Title */}
        <header className="text-center mb-6 md:mb-8">
          <h1
            className="heading-serif tracking-wider text-5xl md:text-6xl font-[900] drop-shadow-[0_3px_2px_rgba(0,0,0,0.55)]"
            style={{ color: "#4C2A1B" }} // CHANGE: dark brown
          >
            Book Burrow
          </h1>
        </header>

        {/* Search */}
        <section className="relative mx-auto max-w-3xl">
          <form onSubmit={onSubmit} className="w-full">
            <div
              className="rounded-full p-3 pl-5 flex items-center gap-2" // CHANGE: keep classes minimal
              style={bubbleStyle} // CHANGE: same style as bubbles
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                aria-label="Search"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/70 text-lg font-sans py-2" // CHANGE: readable on dark glass
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full h-10 w-10 grid place-items-center border border-white/30 hover:border-white/60 transition disabled:opacity-60 disabled:cursor-not-allowed" // CHANGE
                aria-label="Search"
                title="Search"
              >
                <span className="text-white text-lg">ðŸ”</span> {/* CHANGE: ensure white icon */}
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
                  // CHANGE: slightly darker mascot
                  filter: "brightness(0.88) contrast(1.05) saturate(0.9)",
                }}
              />
            </div>

            {bubble && (
              <div
                className="rounded-2xl px-5 py-4 flex-grow font-sans text-white" // CHANGE: text-white
                style={bubbleStyle} // CHANGE: actually apply bubbleStyle
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
                  style={{ backgroundColor: "rgba(255,255,255,0)", height: "160px" }}
                />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article
                  key={`${b.title}-${i}`}
                  className="rounded-3xl font-sans"
                  style={{ ...bubbleStyle, padding: "20px" }} // CHANGE: unify card look
                >
                  <h3 className="text-[22px] font-semibold text-white">{b.title}</h3> {/* CHANGE */}
                  {b.author && (
                    <p className="mt-1 italic text-white/80">by {b.author}</p> // CHANGE
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && (
                      <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-sm">
                        {b.genre}
                      </span>
                    )} {/* CHANGE: chips match dark glass */}
                    {typeof b.year === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-sm">
                        {b.year}
                      </span>
                    )}
                    {typeof b.pages === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-sm">
                        {b.pages}p
                      </span>
                    )}
                    {typeof b.rating === "number" && (
                      <span className="px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-sm">
                        â˜… {b.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed text-white/90">
                      {b.reason}
                    </p>
                  )} {/* CHANGE */}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Toast (kept as-is) */}
      {toast && (
        <div className="fixed bottom-5 right-5 rounded-xl px-4 py-3 text-black bg-[rgba(255,255,255,0.9)] border border-[rgba(0,0,0,0.1)] font-sans">
          {toast}
        </div>
      )}
    </main>
  );
}
