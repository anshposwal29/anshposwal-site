/* =============================================================
   PROJECTS — the source of truth for the Projects & Research page.

   This array is the PERMANENT, public list that everyone sees.

   The page also lets you edit projects LIVE in your browser (flip the
   "Edit" toggle, top-right). Those live edits are saved to your
   browser's localStorage, so they survive reloads — but only on THIS
   machine/browser. They do not change what the public sees.

   To publish your edits so they're permanent and public:
     1. Edit projects on the page in Edit mode (add / edit / delete / reorder).
     2. Click "Export JSON" — the whole list is copied to your clipboard.
     3. Paste it below, replacing the PROJECTS array entirely.
     4. Commit projects-data.js and redeploy (vercel --prod).
   ("Reset to published" on the page clears your local edits and shows
    this file again.)

   Each project:
     id:          stable unique string (used as the key + for reordering)
     title:       string
     categories:  any of: "Research", "AI/ML", "Software", "Finance", "Social Impact"
     summary:     one clear line — shown on the card
     description: optional longer text
     tags:        array of short strings
     image:       optional screenshot — a URL or a path like "assets/foo.png" ("" = none)
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
