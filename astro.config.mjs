// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCjkStrong from './scripts/remark-cjk-strong.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://mowonhua.github.io',
	integrations: [
		mdx({ remarkPlugins: [remarkMath, remarkCjkStrong], rehypePlugins: [rehypeKatex] }),
		sitemap(),
	],
	markdown: {
		remarkPlugins: [remarkMath, remarkCjkStrong],
		rehypePlugins: [rehypeKatex],
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
	},
});
