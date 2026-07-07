/* =============================================================
   PROJECTS — OFFLINE FALLBACK for the Projects & Research page.

   The live source of truth is now the SERVER (Vercel Blob), read via
   GET /api/projects. The page loads that on every visit. This array is
   only used as a fallback when the API can't be reached (e.g. first-ever
   load before anything is published, or a network hiccup).

   To edit the live site: flip the "Edit" toggle (top-right), enter your
   admin token once, then add / edit / reorder — and click "Publish to
   site". Publishing POSTs to /api/projects and writes to Blob, so it's
   instantly live for every visitor. Uploading an image or a PDF in the
   editor stores the file in Blob and fills in its URL automatically —
   no more manual assets/ paths.

   Local edits still buffer in this browser's localStorage as an offline
   draft; "Revert to published" pulls the server's current list back.

   Optional: keep this array roughly in sync with what you've published
   so the fallback looks right. ("Export JSON" copies the current list.)

   Each project:
     id:          stable unique string (used as the key + for reordering)
     title:       string
     categories:  any of: "Research", "AI/ML", "Software", "Finance", "Social Impact"
     summary:     one clear line — shown on the card
     description: optional longer text
     tags:        array of short strings
     image:       optional screenshot — a URL (usually a Blob URL now) or "assets/foo.png" ("" = none)
     pdf:         optional PDF URL (Blob) — adds a "Read" button that opens it inline ("" = none)
     links:       array of { label, url } — label is free text (GitHub, Live demo, Paper (PDF), Notion…)
                  Empty-url links are hidden automatically.
   ============================================================= */
const PROJECTS = [
  {
    id: "prediction-markets",
    title: "Prediction Markets Research",
    categories: ["Research"],
    summary: "How prices move, and how accurate the crowd's forecasts actually are, on Polymarket.",
    description: "Undergraduate research (URAD) with Prof. Herbert Chang, looking at pricing dynamics and forecast accuracy in prediction markets using Polymarket data.",
    tags: ["Polymarket", "Forecasting", "R"],
    image: "",
    links: []
  },
  {
    id: "llm-interpretability",
    title: "Mechanistic Interpretability of LLMs",
    categories: ["Research", "AI/ML"],
    summary: "Where anchoring shows up inside a language model, and why.",
    description: "Studying anchoring behaviour in large language models — how an early number or framing pulls later outputs. Paper in progress.",
    tags: ["Interpretability", "LLMs"],
    image: "",
    links: []
  },
  {
    id: "nlp-finance-sentiment",
    title: "NLP + Finance Sentiment Model",
    categories: ["AI/ML", "Finance"],
    summary: "Reads live news and social sentiment and turns it into short-term stock signals.",
    description: "A model that scores real-time news and social posts for sentiment and weighs them to anticipate short-term stock moves.",
    tags: ["NLP", "Python", "Finance"],
    image: "",
    links: []
  },
  {
    id: "nudge-field-study",
    title: "Nudge Theory Field Study",
    categories: ["Research", "Social Impact"],
    summary: "A 50-interview study on whether reminder nudges actually change behaviour.",
    description: "Qualitative field study on reminder nudges in the service sector, built on 50 interviews. Mentored by Dr. Aparna Venkatesan, LSE.",
    tags: ["Behavioural", "Field study"],
    image: "",
    links: []
  }
];

/* Make available to the page (and to Node, if ever imported). */
if (typeof module !== "undefined" && module.exports) { module.exports = PROJECTS; }
