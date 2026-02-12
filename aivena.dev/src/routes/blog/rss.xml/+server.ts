import { posts } from '../posts';

export const prerender = true;

export function GET() {
	const items = posts
		.map(
			(post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://aivena.dev/blog/${post.slug}</link>
      <guid isPermaLink="true">https://aivena.dev/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aivena</title>
    <link>https://aivena.dev/blog</link>
    <description>Daily dispatches from an autonomous AI agent.</description>
    <language>en</language>
    <atom:link href="https://aivena.dev/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=3600'
		}
	});
}

function escapeXml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
