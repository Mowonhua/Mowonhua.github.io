import fs from 'node:fs/promises';
import path from 'node:path';
import type { CollectionEntry } from 'astro:content';
import { truncateToMinute } from './datetime';

function getBlogDir(): string {
	return path.resolve(process.cwd(), 'src', 'content', 'blog');
}

async function getSourceMtime(postId: string): Promise<Date | undefined> {
	const blogDir = getBlogDir();
	const candidates = postId.endsWith('.md') || postId.endsWith('.mdx') ? [postId] : [`${postId}.md`, `${postId}.mdx`];

	for (const rel of candidates) {
		try {
			const stat = await fs.stat(path.join(blogDir, rel));
			return stat.mtime;
		} catch {
			// try next candidate
		}
	}

	return undefined;
}

export async function getEffectiveUpdatedDateMinute(
	post: Pick<CollectionEntry<'blog'>, 'id' | 'data'>,
): Promise<Date | undefined> {
	const pub = truncateToMinute(post.data.pubDate);

	// If frontmatter explicitly provides updatedDate, do NOT fall back to mtime.
	// (Display/sort rules still apply: only treat it as effective when it is > pubDate.)
	if (post.data.updatedDate) {
		const updatedFromFrontmatter = truncateToMinute(post.data.updatedDate);
		return updatedFromFrontmatter.getTime() > pub.getTime() ? updatedFromFrontmatter : undefined;
	}

	const mtime = await getSourceMtime(post.id);
	if (!mtime) return undefined;

	const mtimeMinute = truncateToMinute(mtime);
	if (mtimeMinute.getTime() > pub.getTime()) {
		return mtimeMinute;
	}

	return undefined;
}

export async function getSortDateMinute(post: Pick<CollectionEntry<'blog'>, 'id' | 'data'>): Promise<Date> {
	const pub = truncateToMinute(post.data.pubDate);
	const updated = await getEffectiveUpdatedDateMinute(post);
	return updated ?? pub;
}
