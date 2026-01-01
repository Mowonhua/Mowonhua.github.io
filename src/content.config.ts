import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { truncateToMinute } from './utils/datetime';

function normalizeMinuteDateString(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	const s = value.trim();
	if (!s) return value;

	// Allow common frontmatter formats like:
	// - 2026-01-01 12:34
	// - 2026-01-01T12:34
	// Normalize to include seconds so Date parsing is stable.
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return `${s.replace(' ', 'T')}:00`;
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`;
	return value;
}

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
				pubDate: z.preprocess(normalizeMinuteDateString, z.coerce.date()).transform(truncateToMinute),
			updatedDate: z
				.preprocess((value) => {
					// YAML `updatedDate:` (no value) becomes null; also guard empty strings.
					if (value == null) return undefined;
					if (typeof value === 'string' && value.trim() === '') return undefined;
						return normalizeMinuteDateString(value);
					}, z.coerce.date().transform(truncateToMinute).optional()),
			tags: z
				.union([z.array(z.string()), z.string()])
				.optional()
				.transform((value) => {
					const raw = value == null ? [] : Array.isArray(value) ? value : [value];
					return raw.map((t) => t.trim()).filter(Boolean);
				}),
			heroImage: image().optional(),
		}),
});

export const collections = { blog };
