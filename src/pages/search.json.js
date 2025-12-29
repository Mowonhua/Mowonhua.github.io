import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');
	const searchIndex = posts.map((post) => ({
		id: post.id,
		title: post.data.title,
		body: post.body || '',
		tags: post.data.tags?.map(t => t.toLowerCase()) || []
	}));
	return new Response(JSON.stringify(searchIndex), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
