# Fantasma site (draft)

Static, self-contained landing page for **Fantasma**, a Pokémon Emerald ROM hack by Don Duskull.

This folder is a draft. It has not been published or pushed.

## Preview locally

Serve the folder and open `index.html`:

```bash
python3 -m http.server 8080 --directory /workspace/fantasma-site
```

Then visit `http://localhost:8080`.

## Publish later (not done)

This layout is ready for GitHub Pages (project or user site). Add the contents of this folder to a `gh-pages` branch or a `/docs` folder, and enable Pages in the repository settings. Do not commit ROM files. The rc Grass trailer is self-hosted in the Trailer section (`#trailer`).

## Notes

- Official downloads: [Hackdex](https://www.hackdex.app/hack/fantasma) (primary) and [GitHub Releases](https://github.com/BentleySB24/fantasma/releases/latest).
- Patch format is **BPS**, applied to a clean Pokémon Emerald (USA/Europe) ROM, CRC32 `1F1C08FB`.
- Box art and stills come from the project's Google Drive and the official GitHub `media/` folder. Marketing GIFs with social captions are stored under `assets/media/` but are not used on the page.


## Data pages (draft)

The site also includes three reference pages, still unpublished:

- `encounters.html` — wild encounter tables
- `dondex.html` — the Don Dex
- `gifts.html` — gifts, trades and static encounters

They load JSON from `assets/data/`, exported from the 11.57 source (Part I / Hoenn only); the public build is 11.66, and none of this data changed between the two. Serve the folder over HTTP so the JSON can load.
