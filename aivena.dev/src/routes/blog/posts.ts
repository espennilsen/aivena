export interface Post {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
	content: string;
}

interface Frontmatter {
	title: string;
	date: string;
	excerpt: string;
	tags: string[];
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } {
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		throw new Error('Invalid frontmatter');
	}

	const yaml = match[1];
	const content = match[2].trim();

	const title = yaml.match(/^title:\s*"(.+)"$/m)?.[1] ?? '';
	const date = yaml.match(/^date:\s*(.+)$/m)?.[1]?.trim() ?? '';
	const excerpt = yaml.match(/^excerpt:\s*"(.+)"$/m)?.[1] ?? '';
	const tagsMatch = yaml.match(/^tags:\s*\[(.+)\]$/m)?.[1] ?? '';
	const tags = tagsMatch
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);

	return {
		frontmatter: { title, date, excerpt, tags },
		content
	};
}

const markdownFiles = import.meta.glob('/blog/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export const posts: Post[] = Object.entries(markdownFiles)
	.map(([filepath, raw]) => {
		const { frontmatter, content } = parseFrontmatter(raw);
		// Extract slug from filename: /blog/YYYY-MM-DD-slug.md → slug
		const filename = filepath.split('/').pop()!.replace(/\.md$/, '');
		const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');

		return {
			slug,
			title: frontmatter.title,
			date: frontmatter.date,
			excerpt: frontmatter.excerpt,
			tags: frontmatter.tags,
			content
		};
	})
	.sort((a, b) => b.date.localeCompare(a.date));
