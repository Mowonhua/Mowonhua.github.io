/**
 * remark plugin: recover unparsed **strong** sequences inside plain text nodes.
 *
 * Why: CommonMark delimiter rules can prevent `**...**` from being parsed when
 * it is adjacent to CJK characters/punctuation (e.g. 反**“映”**数据), leaving
 * literal `**` in output. This plugin rewrites those sequences into mdast
 * `strong` nodes post-parse.
 */
export default function remarkCjkStrong() {
	return function transformer(tree) {
		walk(tree);
	};
}


function walk(node) {
	if (!node || typeof node !== 'object') return;

	if (Array.isArray(node.children)) {
		// 0) Fix the specific bad parse shape: `strong` containing a nested `strong`.
		// This happens with CJK/punctuation adjacency like `**《title》**提出...中的**免疫...**`.
		for (let index = 0; index < node.children.length; index++) {
			const child = node.children[index];
			if (!child || child.type !== 'strong' || !Array.isArray(child.children)) continue;
			if (!containsStrong(child)) continue;

			const replacement = explodeStrongWithNestedStrong(child);
			if (replacement) {
				node.children.splice(index, 1, ...replacement);
				index += replacement.length - 1;
			}
		}

		// First: fix runs of adjacent text nodes (handles `**` split across nodes).
		for (let index = 0; index < node.children.length; index++) {
			const child = node.children[index];
			if (!child || child.type !== 'text' || typeof child.value !== 'string') continue;

			let runEnd = index;
			let joined = child.value;
			while (runEnd + 1 < node.children.length) {
				const next = node.children[runEnd + 1];
				if (!next || next.type !== 'text' || typeof next.value !== 'string') break;
				joined += next.value;
				runEnd++;
			}

			const replacement = rewriteStrongFromText(joined);
			if (replacement) {
				node.children.splice(index, runEnd - index + 1, ...replacement);
				index += replacement.length - 1;
			} else {
				index = runEnd;
			}
		}

		// Second: fix incorrectly-parsed huge `strong` nodes that still contain literal `**`.
		for (let index = 0; index < node.children.length; index++) {
			const child = node.children[index];
			if (!child || child.type !== 'strong') continue;
			if (!Array.isArray(child.children) || child.children.length === 0) continue;
			if (!child.children.every((c) => c && c.type === 'text' && typeof c.value === 'string')) continue;

			const inner = child.children.map((c) => c.value).join('');
			const replacement = splitStrongWithMarkers(inner);
			if (replacement) {
				node.children.splice(index, 1, ...replacement);
				index += replacement.length - 1;
			}
		}

		for (const child of node.children) {
			walk(child);
		}
	}
}

function containsStrong(node) {
	if (!node || !Array.isArray(node.children)) return false;
	return node.children.some((c) => c && c.type === 'strong');
}

function explodeStrongWithNestedStrong(strongNode) {
	// Only handle the CJK-related cases to avoid surprising transformations.
	const flattenedText = flattenText(strongNode);
	if (!looksLikeCjkContext(flattenedText)) return null;

	const out = [];
	let boldBuffer = [];

	for (const child of strongNode.children) {
		if (!child) continue;

		if (child.type === 'strong') {
			// Flush bold segment collected so far.
			if (boldBuffer.length > 0) {
				out.push({ type: 'strong', children: boldBuffer });
				boldBuffer = [];
			}
			// Insert the nested strong's children as plain (this represents the part
			// that should NOT be bold).
			if (Array.isArray(child.children) && child.children.length > 0) {
				for (const plainChild of child.children) {
					out.push(cloneNode(plainChild));
				}
			}
			continue;
		}

		boldBuffer.push(cloneNode(child));
	}

	if (boldBuffer.length > 0) {
		out.push({ type: 'strong', children: boldBuffer });
	}

	// If we didn't actually split into multiple nodes, don't replace.
	if (out.length <= 1) return null;
	return out;
}

function flattenText(node) {
	let s = '';
	if (!node || typeof node !== 'object') return s;
	if (node.type === 'text' && typeof node.value === 'string') return node.value;
	if (Array.isArray(node.children)) {
		for (const c of node.children) s += flattenText(c);
	}
	return s;
}

function cloneNode(node) {
	if (!node || typeof node !== 'object') return node;
	// Drop `position` to keep output clean; remark/rehype don't require it.
	const { position: _position, ...rest } = node;
	if (Array.isArray(rest.children)) {
		return { ...rest, children: rest.children.map(cloneNode) };
	}
	return { ...rest };
}

function rewriteStrongFromText(value) {
	// Fast path: no markers.
	if (!value.includes('**')) return null;
	if (!looksLikeCjkContext(value)) return null;

	const nodes = [];
	let cursor = 0;

	while (true) {
		const open = value.indexOf('**', cursor);
		if (open === -1) break;

		const close = value.indexOf('**', open + 2);
		if (close === -1) break;

		const before = value.slice(cursor, open);
		if (before) nodes.push({ type: 'text', value: before });

		const inner = value.slice(open + 2, close);
		if (inner && inner.trim().length > 0) {
			nodes.push({ type: 'strong', children: [{ type: 'text', value: inner }] });
		} else {
			// If it's empty/whitespace-only, keep the original markers as text.
			nodes.push({ type: 'text', value: value.slice(open, close + 2) });
		}

		cursor = close + 2;
	}

	const tail = value.slice(cursor);
	if (tail) nodes.push({ type: 'text', value: tail });

	// If we didn't actually split anything meaningful, do nothing.
	if (nodes.length === 1 && nodes[0].type === 'text' && nodes[0].value === value) return null;

	return nodes;
}

function splitStrongWithMarkers(value) {
	if (!value.includes('**')) return null;
	if (!looksLikeCjkContext(value)) return null;

	// If odd number of markers, don't guess.
	const markerCount = countOccurrences(value, '**');
	if (markerCount % 2 !== 0) return null;

	const parts = value.split('**');
	// Starting inside an already-parsed strong node.
	let inStrong = true;
	const nodes = [];

	for (const part of parts) {
		if (part) {
			if (inStrong) {
				nodes.push({ type: 'strong', children: [{ type: 'text', value: part }] });
			} else {
				nodes.push({ type: 'text', value: part });
			}
		}
		inStrong = !inStrong;
	}

	// We should end back in strong state after even splits.
	if (!inStrong) return null;
	return nodes.length ? nodes : null;
}

function looksLikeCjkContext(value) {
	// CJK ideographs + CJK punctuation blocks (covers 《》“”（） etc.).
	return /[\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/.test(value);
}

function countOccurrences(haystack, needle) {
	let count = 0;
	let from = 0;
	while (true) {
		const at = haystack.indexOf(needle, from);
		if (at === -1) return count;
		count++;
		from = at + needle.length;
	}
}
