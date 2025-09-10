// app/api/recommend/route.ts
import { NextResponse } from 'next/server';

type Mode = 'topic' | 'genre' | 'description';
type Book = {
  title: string;
  author: string;
  genre?: string;
  year?: number;
  pages?: number;
  rating?: number;
  reason?: string; // why this matches
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = (body?.text ?? '').toString().trim();
    const mode: Mode = (body?.mode ?? 'topic') as Mode;
    const preferences = (body?.preferences ?? '').toString().trim();

    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    const sys = [
      'You are BookLens, a book-only recommender.',
      'You must NEVER answer general questions.',
      'Your job is to return only JSON.',
      'Schema:',
      '{ "books": [ { "title": "...", "author": "...", "genre": "...", "year": 2020, "pages": 320, "rating": 4.5, "reason": "one sentence why" } ] }',
      'Rules: 1) Return ONLY valid JSON (no markdown, code fences, or commentary).',
      '2) 6–9 items max. 3) Prefer popular, well-reviewed, recent where relevant. 4) No duplicates.'
    ].join('\n');

    const userTask =
      mode === 'genre'
        ? `User wants books by genre. Genre query: "${text}".`
        : mode === 'description'
        ? `User described the desired book(s). Description: "${text}".`
        : `User wants books on a topic/theme. Topic: "${text}".`;

    const prefs = preferences ? `Additional preferences: "${preferences}".` : '';

    const payload = {
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `${userTask}\n${prefs}\nRemember: Return ONLY valid JSON per schema.` }
      ],
      temperature: 0.7
    };

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
        'Content-Type': 'application/json',
        // (optional but nice for OpenRouter rankings/limits)
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3001',
        'X-Title': 'BookLens'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: `Upstream ${r.status}: ${t}` }, { status: 500 });
    }

    const data = await r.json();
    let content: string = data?.choices?.[0]?.message?.content ?? '';

    // DeepSeek-R1 may prepend <think>...</think> or code fences; strip them.
    content = content
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/```json/g, '```')
      .replace(/```/g, '')
      .trim();

    // Robust JSON extract: grab the outermost {...}
    function safeParse(str: string) {
      try { return JSON.parse(str); } catch {}
      const start = str.indexOf('{');
      const end = str.lastIndexOf('}');
      if (start >= 0 && end > start) {
        try { return JSON.parse(str.slice(start, end + 1)); } catch {}
      }
      return null;
    }

    const parsed = safeParse(content);
    if (!parsed || !Array.isArray(parsed.books)) {
      return NextResponse.json(
        { error: 'Model did not return valid JSON', raw: content },
        { status: 500 }
      );
    }

    // sanitize books a bit
    const items: Book[] = parsed.books
      .filter((b: any) => b?.title && b?.author)
      .slice(0, 9)
      .map((b: any) => ({
        title: String(b.title),
        author: String(b.author),
        genre: b.genre ? String(b.genre) : undefined,
        year: b.year ? Number(b.year) : undefined,
        pages: b.pages ? Number(b.pages) : undefined,
        rating: b.rating ? Number(b.rating) : undefined,
        reason: b.reason ? String(b.reason) : undefined
      }));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
