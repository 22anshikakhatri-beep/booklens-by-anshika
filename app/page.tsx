// app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type Mode = 'genre' | 'similar' | 'description' | 'topic';
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
  'Fiction','Mystery','Romance','Sci-Fi','Fantasy',
  'Thriller','Biography','History','Self-Help','Literary'
];

export default function Home() {
  const [mode, setMode] = useState<Mode>('topic');
  const [text, setText] = useState('');
  const [preferences, setPreferences] = useState('');
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    if (mode === 'genre') return 'Enter a genre, e.g., Biography, Literary fiction…';
    if (mode === 'similar') return '“Similar to Sally Rooney” or “like Dune”…';
    if (mode === 'description') return 'Describe the vibe: fast-paced, witty, cozy, etc.';
    return 'Topic or theme, e.g., tragicomedy about millennial relationships';
  }, [mode]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  async function runSearch(q?: string, m?: Mode) {
    const qtext = (q ?? text).trim();
    const qmode = m ?? mode;
    if (!qtext) {
      setToast('Please type something first.');
      return;
    }
    setLoading(true);
    setItems([]);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text:
            qmode === 'similar'
              ? `Books similar to ${qtext}`
              : qmode === 'genre'
              ? qtext
              : qtext,
          mode: qmode === 'similar' ? 'topic' : qmode, // backend modes: topic | genre | description
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">BookLens</h1>
          <p className="opacity-80 mt-2">
            A book-only LLM wrapper. It never answers general questions—only curated book
            recommendations.
          </p>
        </header>

        {/* Search Card */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {([
              { key: 'genre', label: 'By Genre' },
              { key: 'similar', label: 'Similar Books' },
              { key: 'description', label: 'Description' },
              { key: 'topic', label: 'Topic' }
            ] as { key: Mode; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                className={
                  'px-3 py-2 rounded-lg text-sm ' +
                  (mode === t.key ? 'bg-white/20 border border-white/20' : 'hover:bg-white/10')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg bg-black/30 border border-white/10 px-4 py-3 outline-none"
            />
            <button
              onClick={() => runSearch()}
              disabled={loading}
              className="px-4 py-3 rounded-lg bg-white/20 border border-white/20 hover:bg-white/30 disabled:opacity-50"
            >
              {loading ? 'Thinking…' : 'Search'}
            </button>
          </div>

          {/* Popular genres chips (help fill text quickly) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRE_TAGS.map(g => (
              <button
                key={g}
                onClick={() => {
                  setMode('genre');
                  setText(g);
                  runSearch(g, 'genre');
                }}
                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10"
              >
                {g}
              </button>
            ))}
          </div>

          {/* Optional preferences */}
          <input
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
            placeholder="Optional preferences (audience, sub-themes, page count…)"
            className="mt-4 w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 outline-none"
          />
        </section>

        {/* Results */}
        {items.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mt-10 mb-4 text-center">Recommended Books</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((b, i) => (
                <article
                  key={`${b.title}-${i}`}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-snug">{b.title}</h3>
                    {b.rating ? (
                      <span className="text-xs bg-white/10 border border-white/10 rounded px-2 py-0.5">
                        ★ {b.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{b.author}</p>
                  <div className="flex flex-wrap gap-2 text-xs mt-3">
                    {b.genre && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                        {b.genre}
                      </span>
                    )}
                    {b.year && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                        {b.year}
                      </span>
                    )}
                    {b.pages && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                        {b.pages}p
                      </span>
                    )}
                  </div>
                  {b.reason && <p className="text-sm opacity-90 mt-3">{b.reason}</p>}
                </article>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!items.length && !loading && (
          <p className="opacity-60 text-center mt-10">Try a genre, “similar to …”, or a description.</p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 rounded-lg bg-white/15 border border-white/20 px-4 py-3 backdrop-blur-sm">
          {toast}
        </div>
      )}
    </main>
  );
}
