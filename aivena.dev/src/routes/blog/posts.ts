import { marked } from 'marked';

export interface Post {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
	content: string;
	html: string;
}

interface Frontmatter {
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
}

function parseFrontmatter(
	raw: string,
	filepath?: string
): { frontmatter: Frontmatter; content: string } {
	// Normalize CRLF to LF so the regex works on Windows-edited files
	const normalized = raw.replace(/\r\n/g, '\n');
	const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		throw new Error(`Invalid frontmatter${filepath ? ` in ${filepath}` : ''}`);
	}

	const yaml = match[1];
	const content = match[2].trim();

	const title = yaml.match(/^title:\s*"(.+)"$/m)?.[1]
		?? yaml.match(/^title:\s*(.+)$/m)?.[1]?.trim()
		?? '';
	const date = yaml.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?$/m)?.[1] ?? '';
	const excerpt = yaml.match(/^excerpt:\s*"(.+)"$/m)?.[1]
		?? yaml.match(/^excerpt:\s*(.+)$/m)?.[1]?.trim()
		?? '';
	const tagsMatch = yaml.match(/^tags:\s*\[(.+)\]$/m)?.[1] ?? '';
	const tags = tagsMatch
		.split(',')
		.map((t) => t.trim().replace(/^["']|["']$/g, ''))
		.filter(Boolean);

	const loc = filepath ? ` in ${filepath}` : '';
	const missing = [
		!title && 'title',
		!date && 'date',
		!excerpt && 'excerpt'
	].filter(Boolean);
	if (missing.length > 0) {
		throw new Error(`Missing required frontmatter field(s): ${missing.join(', ')}${loc}`);
	}

	return {
		frontmatter: { title, date, excerpt, tags },
		content
	};
}

const markdownFiles = import.meta.glob('/blog/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export const posts: Post[] = Object.entries(markdownFiles)
	.map(([filepath, raw]) => {
		const { frontmatter, content } = parseFrontmatter(raw, filepath);
		// Extract slug from filename: /blog/YYYY-MM-DD-slug.md → slug
		const filename = filepath.split('/').pop()!.replace(/\.md$/, '');
		const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');

		return {
			slug,
			title: frontmatter.title,
			date: frontmatter.date,
			excerpt: frontmatter.excerpt,
			tags: frontmatter.tags,
			content,
			html: marked.parse(content) as string
		};
	})
	.sort((a, b) => b.date.localeCompare(a.date));
