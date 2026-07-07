// GET  /api/projects  → public. Returns { projects, source } from Blob, or the
//                       bundled SEED below if nothing has been published yet.
// POST /api/projects  → auth required (x-admin-token header). Saves the full
//                       projects array to Blob so it's live for every visitor.
//
// Auth: compares the x-admin-token header to the ADMIN_TOKEN env var
// (`vercel env add ADMIN_TOKEN`). Reads are always public; only writes are gated.

import { list, put } from '@vercel/blob';
import crypto from 'node:crypto';

const BLOB_KEY = 'data/projects.json';

// SEED — a fallback ONLY used until the first publish writes projects.json to
// Blob. After that, Blob is the source of truth and this is never read. It
// mirrors the bundled projects-data.js (the browser's own offline fallback).
const SEED = [
  {
    id: 'prediction-markets',
    title: 'Prediction Markets Research',
    categories: ['Research'],
    summary: "How prices move, and how accurate the crowd's forecasts actually are, on Polymarket.",
    description: 'Undergraduate research (URAD) with Prof. Herbert Chang, looking at pricing dynamics and forecast accuracy in prediction markets using Polymarket data.',
    tags: ['Polymarket', 'Forecasting', 'R'],
    image: '', pdf: '', links: [],
  },
  {
    id: 'llm-interpretability',
    title: 'Mechanistic Interpretability of LLMs',
    categories: ['Research', 'AI/ML'],
    summary: 'Where anchoring shows up inside a language model, and why.',
    description: 'Studying anchoring behaviour in large language models — how an early number or framing pulls later outputs. Paper in progress.',
    tags: ['Interpretability', 'LLMs'],
    image: '', pdf: '', links: [],
  },
  {
    id: 'nlp-finance-sentiment',
    title: 'NLP + Finance Sentiment Model',
    categories: ['AI/ML', 'Finance'],
    summary: 'Reads live news and social sentiment and turns it into short-term stock signals.',
    description: 'A model that scores real-time news and social posts for sentiment and weighs them to anticipate short-term stock moves.',
    tags: ['NLP', 'Python', 'Finance'],
    image: '', pdf: '', links: [],
  },
  {
    id: 'nudge-field-study',
    title: 'Nudge Theory Field Study',
    categories: ['Research', 'Social Impact'],
    summary: 'A 50-interview study on whether reminder nudges actually change behaviour.',
    description: 'Qualitative field study on reminder nudges in the service sector, built on 50 interviews. Mentored by Dr. Aparna Venkatesan, LSE.',
    tags: ['Behavioural', 'Field study'],
    image: '', pdf: '', links: [],
  },
];

function isAuthed(req) {
  const expected = process.env.ADMIN_TOKEN;
  const got = req.headers['x-admin-token'];
  if (!expected || typeof got !== 'string') return false;
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function str(v, max) {
  return String(v == null ? '' : v).slice(0, max);
}

// Keep only known fields, coerce types, cap lengths — never trust the client.
function sanitize(p) {
  p = p && typeof p === 'object' ? p : {};
  return {
    id: str(p.id || 'p-' + Math.random().toString(36).slice(2), 80),
    title: str(p.title, 200),
    categories: Array.isArray(p.categories) ? p.categories.map((c) => str(c, 40)).slice(0, 12) : [],
    summary: str(p.summary, 400),
    description: str(p.description, 4000),
    tags: Array.isArray(p.tags) ? p.tags.map((t) => str(t, 40)).filter(Boolean).slice(0, 24) : [],
    image: str(p.image, 2000),
    pdf: str(p.pdf, 2000),
    links: Array.isArray(p.links)
      ? p.links.map((l) => ({ label: str(l && l.label, 60), url: str(l && l.url, 2000) }))
          .filter((l) => l.label || l.url).slice(0, 24)
      : [],
  };
}

async function readFromBlob() {
  const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
  const hit = blobs.find((b) => b.pathname === BLOB_KEY);
  if (!hit) return null;
  // Bust the CDN cache with the blob's own uploadedAt so we always read fresh.
  const v = hit.uploadedAt ? new Date(hit.uploadedAt).getTime() : Date.now();
  const r = await fetch(`${hit.url}?v=${v}`, { cache: 'no-store' });
  if (!r.ok) return null;
  const data = await r.json();
  return Array.isArray(data) ? data : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      let data = null;
      try { data = await readFromBlob(); } catch (_) { data = null; }
      const projects = Array.isArray(data) ? data : SEED;
      return res.status(200).json({ projects, source: Array.isArray(data) ? 'blob' : 'seed' });
    }

    if (req.method === 'POST') {
      if (!process.env.ADMIN_TOKEN) {
        return res.status(500).json({ error: 'Server is missing ADMIN_TOKEN. Run: vercel env add ADMIN_TOKEN' });
      }
      if (!isAuthed(req)) {
        return res.status(401).json({ error: 'Unauthorized. Enter your admin token to publish.' });
      }
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const incoming = Array.isArray(body) ? body : body.projects;
      if (!Array.isArray(incoming)) {
        return res.status(400).json({ error: 'Body must be an array or { projects: [...] }.' });
      }
      if (incoming.length > 500) {
        return res.status(400).json({ error: 'Too many projects (max 500).' });
      }
      const clean = incoming.map(sanitize);
      const json = JSON.stringify(clean, null, 2);
      if (json.length > 2_000_000) {
        return res.status(413).json({ error: 'Projects payload too large (max ~2 MB).' });
      }
      const blob = await put(BLOB_KEY, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      });
      return res.status(200).json({ ok: true, count: clean.length, url: blob.url });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    const msg = err && err.message ? err.message : 'unknown error';
    return res.status(500).json({ error: 'Server error: ' + msg });
  }
}
