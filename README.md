# moblog

An Astro-based blog.

## Prerequisites

- Node.js

## Development

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build site: `npm run build`
- Preview build: `npm run preview`

## Content structure

- Drafts: `src/content/drafts/*.md`
- Published posts: `src/content/blog/*.md`

`src/content.config.ts` defines the blog frontmatter schema. Posts in `src/content/blog` must satisfy that schema.

## Create a new draft (Frontmatter generator)

This repo provides a command that generates a Markdown file with a complete frontmatter template under `src/content/drafts`:

- Command: `npm run new:post`

### Interactive usage

Run:

- `npm run new:post`

You will be prompted for:

- `Title`
- `Description` (can be empty)
- `Slug` (defaults to a slugified title)
- `Tags` (comma-separated, optional)
- `Hero image path` (optional)

### CLI usage (non-interactive)

Note: when passing args through `npm run`, include `--`.

- `npm run new:post -- --title "My Post" --description "..." --slug "my-post"`
- `npm run new:post -- --tags "astro,typescript"`
- `npm run new:post -- --heroImage "../assets/hero.png"`
- `npm run new:post -- --date "2025-12-29" --updated "2025-12-29"`

Show help:

- `npm run new:post -- --help`

### Frontmatter fields

The generated frontmatter matches `src/content.config.ts`:

- Required
	- `title`: string
	- `description`: string
	- `pubDate`: `YYYY-MM-DD`
- Optional
	- `updatedDate`: `YYYY-MM-DD` (generated, defaults to `pubDate`)
	- `tags`: array of strings (generated; empty array if omitted)
	- `heroImage`: optional image reference (generated as a commented placeholder if omitted)

## Publish a draft

When you are ready to publish:

1. Move the file from `src/content/drafts` to `src/content/blog`
2. Ensure required frontmatter is present (`title`, `description`, `pubDate`)
3. Run `npm run dev` (or `npm run build`) to verify it parses and renders
