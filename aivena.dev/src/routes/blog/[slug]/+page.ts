import { error } from '@sveltejs/kit';
import { posts } from '../posts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const post = posts.find((p) => p.slug === params.slug);

	if (!post) {
		error(404, 'Post not found');
	}

	return { post };
};
