# shadabahmed.me

Technical CV website for GitHub Pages.

## Stack

- HTML
- CSS
- JavaScript

## Files

- `index.html` - Main GitHub Pages entrypoint
- `css/style.css` - Visual design, dark/light themes, print styles
- `cv/formal-cv.html` - Formal monochrome CV page
- `css/formal-cv.css` - Styles for formal CV page and print/PDF layout
- `js/main.js` - Theme toggle, sticky nav, smooth section scrolling, and UI interactions
- `cv/shadab_ahmed_cv.pdf` - Downloadable PDF CV

## Local Preview

Use any static server from this repo root. Example:

```bash
ruby -run -e httpd . -p 4000
```

Then open `http://localhost:4000`.

Formal CV page:

- `http://localhost:4000/cv/formal-cv.html`

## GitHub Pages Setup

1. Push this repository to GitHub.
2. Go to `Settings` -> `Pages`.
3. Set source to `Deploy from a branch`.
4. Select your branch (usually `main`) and root folder `/`.
5. Save.

Your site will serve `index.html` automatically.

## PDF Options

- Click `Download CV PDF` to download `cv/shadab_ahmed_cv.pdf`.
