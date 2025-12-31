import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z
				.preprocess((value) => {
					// YAML `updatedDate:` (no value) becomes null; also guard empty strings.
					if (value == null) return undefined;
					if (typeof value === 'string' && value.trim() === '') return undefined;
					return value;
				}, z.coerce.date().optional()),
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
