import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';

function usage() {
	return `Usage:
  npm run new

Optional args:
  --title "My Post"
  --description "..."
  --slug "my-post"
  --tags "astro,typescript"
  --heroImage "../assets/hero.png"
	--date "2025-12-29 14:05"     (defaults to now, minute precision)
	--updated "2025-12-29 14:05"  (optional; only set when provided)

Notes:
- Creates a Markdown draft in src/content/drafts
- Frontmatter matches src/content.config.ts schema for the blog collection
`;
}

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith('--')) continue;
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
	return args;
}

function pad2(n) {
	return String(n).padStart(2, '0');
}

function formatDateYYYYMMDD(d) {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function truncateToMinute(d) {
	return new Date(Math.floor(d.getTime() / 60_000) * 60_000);
}

function formatDateTimeYYYYMMDDHHmm(d) {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function parseDateTimeOrThrow(input, flagName) {
	if (typeof input !== 'string') {
		throw new Error(`Invalid ${flagName} date: ${String(input)}`);
	}
	const s = input.trim();

	// Allow YYYY-MM-DD (assume 00:00)
	if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
		const d = new Date(`${s}T00:00:00`);
		if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${flagName} date: ${s}`);
		return formatDateTimeYYYYMMDDHHmm(d);
	}

	// Allow YYYY-MM-DD HH:mm
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
		const d = new Date(`${s.replace(' ', 'T')}:00`);
		if (Number.isNaN(d.getTime())) {
			throw new Error(`Invalid ${flagName} date (expected YYYY-MM-DD HH:mm): ${s}`);
		}
		return formatDateTimeYYYYMMDDHHmm(d);
	}

	// Allow YYYY-MM-DDTHH:mm
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
		const d = new Date(`${s}:00`);
		if (Number.isNaN(d.getTime())) {
			throw new Error(`Invalid ${flagName} date (expected YYYY-MM-DDTHH:mm): ${s}`);
		}
		return formatDateTimeYYYYMMDDHHmm(d);
	}

	throw new Error(
		`Invalid ${flagName} date (expected YYYY-MM-DD HH:mm or YYYY-MM-DDTHH:mm; YYYY-MM-DD is also accepted): ${s}`,
	);
}

function slugify(input) {
	return String(input)
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');
}

function splitTags(input) {
	if (input == null) return [];
	const raw = String(input)
		.split(/[,，]/)
		.map((t) => t.trim())
		.filter(Boolean);
	// de-dupe while preserving order
	const seen = new Set();
	return raw.filter((t) => {
		if (seen.has(t)) return false;
		seen.add(t);
		return true;
	});
}

function escapeYamlString(value) {
	// Keep it simple: always double-quote and escape
	return `"${String(value).replace(/\\/g, '\\\\').replace(/\"/g, '\\"')}"`;
}

function frontmatter({ title, description, date, updated, tags, heroImage }) {
	const lines = [];
	const indent = '  ';
	lines.push('---');
	lines.push(`title: ${escapeYamlString(title)}`);
	lines.push(`description: ${escapeYamlString(description)}`);
	lines.push(`pubDate: ${date}`);
	if (updated) {
		lines.push(`updatedDate: ${updated}`);
	}
	lines.push('tags:');
	if (tags.length === 0) {
		lines.push(`${indent}[]`);
	} else {
		for (const tag of tags) {
			lines.push(`${indent}- ${escapeYamlString(tag)}`);
		}
	}
	if (heroImage) {
		lines.push(`heroImage: ${escapeYamlString(heroImage)}`);
	} else {
		// Placeholder without breaking schema (field is optional)
		lines.push('# heroImage: "../assets/your-hero.png"');
	}
	lines.push('---');
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

async function resolveUniquePath(dir, baseName) {
	const ext = path.extname(baseName) || '.md';
	const nameOnly = baseName.endsWith(ext) ? baseName.slice(0, -ext.length) : baseName;
	let candidate = path.join(dir, `${nameOnly}${ext}`);
	if (!(await fileExists(candidate))) return candidate;
	for (let i = 2; i < 10_000; i++) {
		candidate = path.join(dir, `${nameOnly}-${i}${ext}`);
		if (!(await fileExists(candidate))) return candidate;
	}
	throw new Error('Unable to find a unique filename');
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help || args.h) {
		process.stdout.write(usage());
		return;
	}

	const nowMinute = truncateToMinute(new Date());
	const date = args.date ? parseDateTimeOrThrow(args.date, '--date') : formatDateTimeYYYYMMDDHHmm(nowMinute);
	const updated = args.updated ? parseDateTimeOrThrow(args.updated, '--updated') : undefined;

	let title = typeof args.title === 'string' ? args.title.trim() : '';
	let description = typeof args.description === 'string' ? args.description.trim() : '';
	let slug = typeof args.slug === 'string' ? args.slug.trim() : '';
	let tags = splitTags(args.tags);
	let heroImage = typeof args.heroImage === 'string' ? args.heroImage.trim() : '';

	if (!title || !slug || description === '' || (tags.length === 0 && typeof args.tags !== 'string') || !heroImage) {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		try {
			if (!title) title = (await rl.question('Title: ')).trim();
			if (description === '') {
				description = (await rl.question('Description (can be empty): ')).trim();
			}
			if (!slug) {
				const suggested = slugify(title);
				const answer = (await rl.question(`Slug (default: ${suggested}): `)).trim();
				slug = answer || suggested;
			}
			if (typeof args.tags !== 'string') {
				const tagsInput = (await rl.question('Tags (comma-separated, optional): ')).trim();
				tags = splitTags(tagsInput);
			}
			if (!heroImage && typeof args.heroImage !== 'string') {
				heroImage = (await rl.question('Hero image path (optional): ')).trim();
			}
		} finally {
			rl.close();
		}
	}

	if (!title) throw new Error('Title is required');
	if (!slug) throw new Error('Slug is required');

	const cwd = process.cwd();
	const draftsDir = path.resolve(cwd, 'src', 'content', 'drafts');
	await fs.mkdir(draftsDir, { recursive: true });

	const filename = `${slug}.md`;
	const fullPath = await resolveUniquePath(draftsDir, filename);

	const fm = frontmatter({
		title,
		description,
		date,
		updated,
		tags,
		heroImage: heroImage ? heroImage : undefined,
	});

	const body = `${fm}\n\n`;
	await fs.writeFile(fullPath, body, { encoding: 'utf8', flag: 'wx' });

	const rel = path.relative(cwd, fullPath).split(path.sep).join('/');
	process.stdout.write(`Created: ${rel}\n`);
}

main().catch((err) => {
	process.stderr.write(`${err?.message ?? String(err)}\n`);
	process.exitCode = 1;
});
