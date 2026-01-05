import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function usage() {
	return `Usage:
	  npm run post
	  npm run post <name>
	  npm run post -- --slug "my-post"
	  npm run post -- --file "src/content/drafts/my-post.md"

Positional:
	<name>              Publish drafts whose relative path/filename contains <name>
	                   (case-insensitive, substring match). Publishes all matches.

Options:
  --slug "my-post"     Draft filename (without extension)
  --file "..."         Path to a draft file under src/content/drafts

Behavior:
- Moves the draft into src/content/blog
- Updates pubDate to the current local time (minute precision)
- Does NOT auto-set updatedDate

Slug matching:
- If exact match is not found, --slug does a fuzzy match against draft filenames
	under src/content/drafts (case-insensitive, substring match).
- If multiple drafts match, the script will list them and ask you to be more specific.
`;
}

function parseCli(argv) {
	/** @type {Record<string, string | boolean>} */
	const args = {};
	/** @type {string[]} */
	const positionals = [];

	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (token === '--') {
			positionals.push(...argv.slice(i + 1));
			break;
		}
		if (!token.startsWith('--')) {
			positionals.push(token);
			continue;
		}
		const key = token.slice(2);
		if (!key) continue;
		const next = argv[i + 1];
		if (next == null || next.startsWith('--')) {
			args[key] = true;
			continue;
		}
		args[key] = next;
		i++;
	}

	return { args, positionals };
}

function pad2(n) {
	return String(n).padStart(2, '0');
}

function truncateToMinute(d) {
	return new Date(Math.floor(d.getTime() / 60_000) * 60_000);
}

function formatDateTimeYYYYMMDDHHmm(d) {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function resolvePathsFromArgs({ cwd, slug, file }) {
	const draftsDir = path.resolve(cwd, 'src', 'content', 'drafts');
	const blogDir = path.resolve(cwd, 'src', 'content', 'blog');

	if (typeof file === 'string' && file.trim()) {
		const src = path.resolve(cwd, file.trim());
		return { draftsDir, blogDir, src };
	}

	if (typeof slug === 'string' && slug.trim()) {
		return { draftsDir, blogDir, src: null };
	}

	return { draftsDir, blogDir, src: null };
}

function relFrom(rootDir, fullPath) {
	return path.relative(rootDir, fullPath).split(path.sep).join('/');
}

function relNoExtFrom(rootDir, fullPath) {
	return relFrom(rootDir, fullPath).replace(/\.(md|mdx)$/i, '');
}

function normalizeNeedle(input) {
	return String(input ?? '')
		.trim()
		.replace(/\.(md|mdx)$/i, '')
		.toLowerCase();
}

async function listDraftMarkdownFiles(rootDir) {
	/** @type {string[]} */
	const out = [];

	/** @param {string} dir */
	const walk = async (dir) => {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const ent of entries) {
			const full = path.join(dir, ent.name);
			if (ent.isDirectory()) {
				if (ent.name.startsWith('.')) continue;
				await walk(full);
				continue;
			}
			if (!ent.isFile()) continue;
			if (!/\.(md|mdx)$/i.test(ent.name)) continue;
			out.push(full);
		}
	};

	await walk(rootDir);
	return out;
}

function scoreSlugMatch(slugNeedle, relNoExt) {
	const needle = slugNeedle.toLowerCase();
	const rel = relNoExt.toLowerCase();
	const base = path.posix.basename(rel);

	if (rel === needle) return 100;
	if (base === needle) return 95;
	if (rel.endsWith(`/${needle}`)) return 90;
	if (base.startsWith(needle)) return 80;
	if (rel.includes(needle)) return 60;
	return 0;
}

async function resolveDraftFromSlugFuzzy({ cwd, draftsDir, slug }) {
	const raw = String(slug).trim();
	const needle = raw.replace(/\.(md|mdx)$/i, '');

	// 1) Fast exact checks in root (common case)
	for (const ext of ['.md', '.mdx']) {
		const direct = path.join(draftsDir, `${needle}${ext}`);
		if (await fileExists(direct)) return direct;
	}

	// 2) Recursive fuzzy match
	const files = await listDraftMarkdownFiles(draftsDir);
	const scored = files
		.map((full) => {
			const rel = path.relative(draftsDir, full).split(path.sep).join('/');
			const relNoExt = rel.replace(/\.(md|mdx)$/i, '');
			return { full, rel, score: scoreSlugMatch(needle, relNoExt) };
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score || a.rel.localeCompare(b.rel));

	if (scored.length === 0) {
		throw new Error(`No matching draft found for --slug ${JSON.stringify(raw)}`);
	}

	const bestScore = scored[0].score;
	const best = scored.filter((x) => x.score === bestScore);
	if (best.length > 1) {
		const list = best.map((x) => `- ${x.rel}`).join('\n');
		throw new Error(`Multiple drafts match --slug ${JSON.stringify(raw)}:\n${list}\nPlease provide a more specific --slug or use --file.`);
	}

	return best[0].full;
}

function parseFrontmatter(markdown) {
	// Only supports YAML frontmatter at the top of the file.
	if (!markdown.startsWith('---\n')) return null;
	const end = markdown.indexOf('\n---\n', 4);
	if (end === -1) return null;

	const raw = markdown.slice(4, end);
	const rest = markdown.slice(end + '\n---\n'.length);
	return { raw, rest };
}

function updatePubDateInFrontmatter(frontmatterRaw, pubDateValue) {
	const lines = frontmatterRaw.split('\n');
	let replaced = false;
	for (let i = 0; i < lines.length; i++) {
		if (/^pubDate:\s*/.test(lines[i])) {
			lines[i] = `pubDate: ${pubDateValue}`;
			replaced = true;
			break;
		}
	}

	if (!replaced) {
		// Insert after description if present, else after title if present, else at top.
		let insertAt = 0;
		for (let i = 0; i < lines.length; i++) {
			if (/^description:\s*/.test(lines[i])) {
				insertAt = i + 1;
				break;
			}
			if (/^title:\s*/.test(lines[i])) {
				insertAt = i + 1;
			}
		}
		lines.splice(insertAt, 0, `pubDate: ${pubDateValue}`);
	}

	return lines.join('\n');
}

async function fileExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function publishOneDraft({ cwd, draftsDir, blogDir, srcNormalized, pubDateValue }) {
	if (!srcNormalized.startsWith(draftsDir + path.sep)) {
		throw new Error(`Draft file must be under ${draftsDir}`);
	}

	if (!(await fileExists(srcNormalized))) {
		throw new Error(`Draft not found: ${relFrom(cwd, srcNormalized)}`);
	}

	const relFromDrafts = path.relative(draftsDir, srcNormalized);
	const dest = path.join(blogDir, relFromDrafts);

	if (await fileExists(dest)) {
		throw new Error(`Destination already exists: ${relFrom(cwd, dest)}`);
	}

	const markdown = await fs.readFile(srcNormalized, 'utf8');
	const fm = parseFrontmatter(markdown);
	if (!fm) {
		throw new Error('Draft is missing YAML frontmatter (expected starting --- block)');
	}

	const updatedFrontmatter = updatePubDateInFrontmatter(fm.raw, pubDateValue);
	const out = `---\n${updatedFrontmatter}\n---\n${fm.rest}`;

	await fs.mkdir(path.dirname(dest), { recursive: true });
	await fs.writeFile(dest, out, { encoding: 'utf8', flag: 'wx' });
	await fs.unlink(srcNormalized);

	return dest;
}

async function publishManyDrafts({ cwd, draftsDir, blogDir, sources, pubDateValue }) {
	if (sources.length === 0) {
		process.stdout.write('No drafts to publish.\n');
		return;
	}

	// Preflight: normalize + validate + detect conflicts before moving anything.
	const normalized = sources.map((p) => path.resolve(p));
	for (const p of normalized) {
		if (!p.startsWith(draftsDir + path.sep)) {
			throw new Error(`Draft file must be under ${draftsDir}: ${relFrom(cwd, p)}`);
		}
		if (!(await fileExists(p))) {
			throw new Error(`Draft not found: ${relFrom(cwd, p)}`);
		}
	}

	const dests = normalized.map((p) => path.join(blogDir, path.relative(draftsDir, p)));
	const conflicts = [];
	for (const dest of dests) {
		if (await fileExists(dest)) conflicts.push(relFrom(cwd, dest));
	}
	if (conflicts.length > 0) {
		throw new Error(`Destination already exists:\n${conflicts.map((x) => `- ${x}`).join('\n')}`);
	}

	// Publish in a stable order.
	const ordered = normalized
		.map((full) => ({ full, rel: relFrom(draftsDir, full) }))
		.sort((a, b) => a.rel.localeCompare(b.rel));

	for (const item of ordered) {
		const dest = await publishOneDraft({ cwd, draftsDir, blogDir, srcNormalized: item.full, pubDateValue });
		process.stdout.write(`Published: ${relFrom(cwd, dest)}\n`);
	}
}

async function main() {
	const { args, positionals } = parseCli(process.argv.slice(2));
	if (args.help || args.h) {
		process.stdout.write(usage());
		return;
	}

	// Allow `npm run post --slug=...` without `-- --slug ...`
	if (typeof args.slug !== 'string' && typeof process.env.npm_config_slug === 'string') {
		args.slug = process.env.npm_config_slug;
	}
	if (typeof args.file !== 'string' && typeof process.env.npm_config_file === 'string') {
		args.file = process.env.npm_config_file;
	}

	const cwd = process.cwd();
	const { draftsDir, blogDir, src: srcFromArgs } = resolvePathsFromArgs({ cwd, slug: args.slug, file: args.file });
	const pubDateValue = formatDateTimeYYYYMMDDHHmm(truncateToMinute(new Date()));

	// Case 1: explicit --file
	if (typeof args.file === 'string' && args.file.trim()) {
		const srcNormalized = path.resolve(cwd, args.file.trim());
		const dest = await publishOneDraft({ cwd, draftsDir, blogDir, srcNormalized, pubDateValue });
		process.stdout.write(`Published: ${relFrom(cwd, dest)}\n`);
		return;
	}

	// Case 2: explicit --slug
	if (typeof args.slug === 'string' && args.slug.trim()) {
		const src = await resolveDraftFromSlugFuzzy({ cwd, draftsDir, slug: args.slug });
		const dest = await publishOneDraft({ cwd, draftsDir, blogDir, srcNormalized: path.resolve(src), pubDateValue });
		process.stdout.write(`Published: ${relFrom(cwd, dest)}\n`);
		return;
	}

	// Case 3: positional filter (publish all matches)
	const needle = positionals.length > 0 ? normalizeNeedle(positionals[0]) : '';
	if (positionals.length > 1) {
		throw new Error(`Too many positional args: ${positionals.map((x) => JSON.stringify(x)).join(', ')}`);
	}

	const allDrafts = await listDraftMarkdownFiles(draftsDir);
	if (needle) {
		const matches = allDrafts.filter((full) => relNoExtFrom(draftsDir, full).toLowerCase().includes(needle));
		if (matches.length === 0) {
			throw new Error(`No matching drafts found for ${JSON.stringify(positionals[0])}`);
		}
		await publishManyDrafts({ cwd, draftsDir, blogDir, sources: matches, pubDateValue });
		return;
	}

	// Case 4: no args => publish everything under drafts
	await publishManyDrafts({ cwd, draftsDir, blogDir, sources: allDrafts, pubDateValue });
}

main().catch((err) => {
	process.stderr.write(`${err?.message ?? String(err)}\n`);
	process.exitCode = 1;
});
