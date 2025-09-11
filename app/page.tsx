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
          mode: qmode === "similar" ? "topic" : qmode, // backend expects: topic | genre | description
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
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/background.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Soft vignette overlay */}
      <div className="absolute inset-0 vignette" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        {/* Hero title */}
        <header className="text-center mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Book Burrow
          </h1>
        </header>

        {/* Search zone */}
        <section className="relative mx-auto max-w-3xl">
          {/* Mascot (left of search) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt="Bookish cat"
            className="hidden md:block absolute -left-24 -top-10 w-28 h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
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
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/10")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pill search bar */}
          <div className="bg-coffee-glass rounded-full p-2 pl-4 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-neutral-200/70 text-neutral-50 py-2"
            />
            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {GENRE_TAGS.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setMode("genre");
                  setText(g);
                  runSearch(g, "genre");
                }}
                className="chip"
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
            className="mt-4 w-full rounded-xl bg-coffee-glass px-4 py-3 outline-none text-neutral-50 placeholder:text-neutral-200/70"
          />
        </section>

        {/* Results */}
        <section className="mt-10">
          {!loading && items.length === 0 && (
            <p className="text-center text-neutral-200/80">
              Try a genre, “similar to …”, or a description.
            </p>
          )}

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-coffee-glass h-40 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article key={`${b.title}-${i}`} className="card p-5 text-neutral-100">
                  {/* Title + byline (clear hierarchy like your reference) */}
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  {b.author && <p className="mt-0.5 text-neutral-300 italic">by {b.author}</p>}

                  {/* Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && <span className="chip">{b.genre}</span>}
                    {typeof b.year === "number" && <span className="chip">{b.year}</span>}
                    {typeof b.pages === "number" && <span className="chip">{b.pages}p</span>}
                    {typeof b.rating === "number" && <span className="chip">★ {b.rating.toFixed(1)}</span>}
                  </div>

                  {/* Description */}
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed text-neutral-100/90">
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
        <div className="fixed bottom-5 right-5 rounded-lg bg-coffee-glass px-4 py-3 text-neutral-50">
          {toast}
        </div>
      )}
    </main>
  );
}
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
          mode: qmode === "similar" ? "topic" : qmode, // backend expects: topic | genre | description
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
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/background.png"
        alt=""
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Soft vignette overlay */}
      <div className="absolute inset-0 vignette" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12">
        {/* Hero title */}
        <header className="text-center mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Book Burrow
          </h1>
        </header>

        {/* Search zone */}
        <section className="relative mx-auto max-w-3xl">
          {/* Mascot (left of search) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt="Bookish cat"
            className="hidden md:block absolute -left-24 -top-10 w-28 h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
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
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/80 hover:bg-white/15 border border-white/10")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pill search bar */}
          <div className="bg-coffee-glass rounded-full p-2 pl-4 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none placeholder:text-neutral-200/70 text-neutral-50 py-2"
            />
            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* Quick chips */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {GENRE_TAGS.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setMode("genre");
                  setText(g);
                  runSearch(g, "genre");
                }}
                className="chip"
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
            className="mt-4 w-full rounded-xl bg-coffee-glass px-4 py-3 outline-none text-neutral-50 placeholder:text-neutral-200/70"
          />
        </section>

        {/* Results */}
        <section className="mt-10">
          {!loading && items.length === 0 && (
            <p className="text-center text-neutral-200/80">
              Try a genre, “similar to …”, or a description.
            </p>
          )}

          {loading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-coffee-glass h-40 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article key={`${b.title}-${i}`} className="card p-5 text-neutral-100">
                  {/* Title + byline (clear hierarchy like your reference) */}
                  <h3 className="text-xl font-semibold">{b.title}</h3>
                  {b.author && <p className="mt-0.5 text-neutral-300 italic">by {b.author}</p>}

                  {/* Chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.genre && <span className="chip">{b.genre}</span>}
                    {typeof b.year === "number" && <span className="chip">{b.year}</span>}
                    {typeof b.pages === "number" && <span className="chip">{b.pages}p</span>}
                    {typeof b.rating === "number" && <span className="chip">★ {b.rating.toFixed(1)}</span>}
                  </div>

                  {/* Description */}
                  {b.reason && (
                    <p className="mt-4 text-[15px] leading-relaxed text-neutral-100/90">
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
        <div className="fixed bottom-5 right-5 rounded-lg bg-coffee-glass px-4 py-3 text-neutral-50">
          {toast}
        </div>
      )}
    </main>
  );
}
