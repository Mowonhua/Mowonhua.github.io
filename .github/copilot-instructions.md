# Copilot instructions (moblog)

## Project snapshot
- Static blog built with **Astro v5**. Routes live in `src/pages/` and compose UI from `src/components/`.
- Blog content is an **Astro Content Collection** (`blog`) defined in `src/content.config.ts` and loaded from `src/content/blog/**/*.{md,mdx}`.
- Markdown supports **math + KaTeX** via `remark-math`/`rehype-katex` (see `astro.config.mjs`) and KaTeX CSS is imported in `src/styles/global.css`.

## Dev workflows (Node)
- Install: `npm.cmd install`
- Dev server: `npm.cmd run dev`
- Build: `npm.cmd run build`
- Preview: `npm.cmd run preview`
- New post generator: `npm.cmd run new -- --help` (implemented in `scripts/new.mjs`).

## Content + routing conventions
- **Single post pages**: `src/pages/blog/[...slug].astro` uses `getCollection('blog')` + `render(post)` and passes `headings` into `src/layouts/BlogPost.astro`.
  - Slug is `post.id` (derived from the file path under `src/content/blog`).
- **Frontmatter schema** (enforced by `src/content.config.ts`):
  - required: `title`, `description`, `pubDate`
  - optional: `updatedDate`, `tags`, `heroImage`
  - `tags` is normalized to a trimmed string array (accepts single string or array in frontmatter).
- Drafts are kept in `src/content/drafts/` (not part of the collection). To publish, move the file into `src/content/blog/`.

## UI + styling conventions
- Global styles are pulled in via `src/components/BaseHead.astro` importing `src/styles/global.css`.
- Theme is controlled by `html[data-theme='dark']` with CSS variables in `src/styles/global.css`.
  - Toggle logic is in `src/components/ThemeToggle.astro` (persists to `localStorage` key `theme`).

## Blog list, tags, and search
- Blog index: `src/pages/blog/index.astro` sorts posts by `pubDate` desc, renders cards, and provides:
  - Tag filtering via `data-tags` attributes and checkbox state.
  - Full-text search via `/search.json`.
- Search index endpoint: `src/pages/search.json.js` returns `{id,title,body,tags}` for the `blog` collection.
- Tag-based card background colors come from `TAG_COLORS` in `src/consts.ts` (keys are lowercased tags; fallback key is `default`).
- Header search box (`src/components/Header.astro`) dispatches `window` event `search-updated`; the blog index listens for it.

## Practical edit pointers
- When adjusting meta tags / global head elements, start in `src/components/BaseHead.astro`.
- When changing how a post page renders (hero image, TOC, dates), start in `src/layouts/BlogPost.astro`.
- If math rendering looks off, check `astro.config.mjs` plugin config and KaTeX import in `src/styles/global.css`.
