# Ansh Oswal — personal site

Static, zero-build site. Files:

- `index.html` — home (hero, about, work, coursework, toolkit)
- `projects.html` — projects grid (data-driven; edit the `PROJECTS` list)
- `style.css` — shared styles
- `assets/` — put images here (see below)

## Add your images (required)

Drop these two files into an `assets/` folder next to the HTML:

- `assets/hero-mountain.jpg` — mountain photo → home hero background
- `assets/profile.jpg` — headshot → avatar circle

Project screenshots and PDFs also go in `assets/` and are linked from `projects.html`.

## Deploy to Vercel (free)

```bash
gh auth switch --user anshposwal29   # make sure you're NOT on ansh-ipxos
gh auth status

git init && git add . && git commit -m "Personal site v1"
gh repo create anshposwal29/personal-site --public --source=. --push

npm i -g vercel
vercel --prod        # framework preset: Other
```

You'll get a free `anshoswal.vercel.app` URL. Add a custom domain (`anshoswal.com`, ~$10–15/yr) later under Project → Settings → Domains; hosting stays free.

## Add a project

In `projects.html`, edit the `PROJECTS = [ ... ]` array. Each entry:

```js
{
  title: "Project name",
  desc: "One or two sentences.",
  tags: ["Python", "ML"],
  image: "assets/screenshot.png",   // optional
  links: { "GitHub": "https://github.com/...", "Paper (PDF)": "assets/paper.pdf" }
}
```

Empty or missing links/images are hidden automatically.
