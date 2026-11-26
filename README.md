# Ansh Pritam Oswal: personal site

Live at https://anshposwal.vercel.app. A static site with no build step: plain HTML and CSS, deployed by pushing to `main`.

## The approach: show, don't tell

Each piece of work is shown by its evidence (a figure, a photo, a number, a line from the paper) and kept to one or two sentences of text. Every item links to proof: the paper, the code, a live site, or a poster.

Three rules the page follows:

1. **Every entry has something to look at.** In order of preference: a real figure from the work, a photo of it happening, two or three headline numbers, a line quoted from the paper.
2. **Every image must be readable at the size it is shown.** A first-page thumbnail of a PDF is not readable, so it is not used. Wide multi-panel figures are cropped to the few panels that can be read (the markets chart shows 4 of 10 panels; the poster shows one finding).
3. **Every entry has a proof link, or says it is in preparation.** Work without a public artefact sits in the "In the works" dropdown and carries no link.
4. **No tag clouds or stat cards.** Facts are written as plain sentences in ruled rows.
5. **It must work on a phone.** Charts scroll sideways on small screens instead of shrinking until unreadable.

## Pages

| URL | File | What it is |
|---|---|---|
| `/` | `index.html` | The site: research, papers, project, experience, photos |
| `/work/game-theory`, `/work/chess-openings` | `work/*/index.html` | Two interactive D3 pieces from QSS 19, hosted as they were built |
| `/card` | `card.html` | Digital contact card with "Add to Contacts"; opens in its own tab |
| `/home` | (redirect) | Old address, redirects to `/` (see `vercel.json`) |
| `/projects` | (redirect) | The old projects page was removed; redirects to `/` |

## Files

- `index.html`: all content, in page order. One long file, no templates.
- `site.css`: all styles for `index.html`. Colours and fonts are variables at the top.
- `card.html`: self-contained (inline styles and the vCard), in the same colours and fonts as the site.
- `assets/papers/`: the PDFs that the page links to.
- `assets/img/`: figures (`fig-*.png/jpg`) and photos.
- `assets_photos/`: original photos. Not committed.

## Sections of `index.html` and the block each one uses

| Section | Block | Use it for |
|---|---|---|
| Research, lead item | `article.feature` | The one piece of work to lead with: photo, title, link chips, then a full-width figure |
| Research | `article.withfig` | Figure on one side, text on the other. Add `flip` to swap sides |
| Research | `.nums` inside `withfig` | Work with no figure: three headline numbers instead |
| Research | `details.more` | Dropdowns for work in progress and earlier work with no public artefact |
| Works of interest | `article.withfig` | A project or paper that has a figure. Add `shot` when the image is a screenshot of an interactive piece |
| Works of interest | `a.book` | A paper with no figure: a coloured card with one quoted line (`.sheet.t1` to `.t5` set the colour) |
| Experience | `ul.xp li` | One row per role: title, organisation, dates |
| Experience | `.army` | Text beside photos for one role |
| Education | `dl.ledger` | Ruled rows: a label on the left, a plain sentence on the right. Coursework is a `ul.courselist` |
| Outside | `.photos figure` | Photos, with an optional caption pill |

Links inside an entry go in `<div class="chips">`. The main proof link gets `class="main"` (green); the rest are outlined.

## Paper reader and code links

- Any link to a `.pdf` opens in an in-page reader on desktop, with "Open in new tab" and Close (Esc also closes). On phones, or with Cmd/Ctrl-click, the PDF opens in a new tab instead. The script is at the bottom of `index.html`.
- Code links go to the public GitHub repositories. A repository that is private must not be linked; link a report or paper instead.

## The index

The pill fixed at the bottom of the page opens a list of every paper and every codebase or demo. It is a hand-written list (`#index` near the bottom of `index.html`): when you add a paper or a repository, add a line there and update the counts on the button.

## Adding a piece of work

1. Put the PDF in `assets/papers/` with a lower-case hyphenated name.
2. Make the image:
   - A figure: export it from the paper's source at about 1,500 to 2,000 px wide, or crop it from the PDF with `pdftoppm -r 150 -png -singlefile paper.pdf out` and an image editor. Check it is readable at about 650 px wide.
   - A photo: resize to at most 1,600 px on the long side.
   - Neither: pick three numbers (`.nums`) or one sentence quoted from the paper (`a.book`).
3. Copy the nearest existing block in `index.html` and change the text, image and links. Keep the description to two sentences.
4. Open `index.html` in a browser and check the image is readable and every link works.

## Design

- Type: Instrument Serif for headings and numbers, Hanken Grotesk for everything else (Google Fonts).
- Colour: warm paper background `#f3f0e8`, near-black text, Dartmouth green `#00693e` for links and labels, deep green `#0c3b28` for the dark panels and footer.
- One accent colour only. Charts keep their own colours.

## Deploy

```bash
gh auth status          # the active account must be anshposwal29
git add -A && git commit -m "..." && git push origin main
```

Vercel deploys `main` automatically within about a minute.
