import { loadBlogPosts, loadAuthors, loadProjects } from '$lib/content';
import { readingTime } from '$lib/utils';
import type { BlogPost, Author, Project, ParsedAuthor, TOCHeading, TOCSection } from '$lib/types';

// --- Authors ---

export function getAllAuthors(): Author[] {
	return loadAuthors();
}

// --- Posts ---

export function getAllPosts(): BlogPost[] {
	return loadBlogPosts()
		.filter((post) => !post.metadata.draft && !isSubpost(post.id))
		.sort((a, b) => new Date(b.metadata.date).valueOf() - new Date(a.metadata.date).valueOf());
}

export function getAllPostsAndSubposts(): BlogPost[] {
	return loadBlogPosts()
		.filter((post) => !post.metadata.draft)
		.sort((a, b) => new Date(b.metadata.date).valueOf() - new Date(a.metadata.date).valueOf());
}

// --- Projects ---

export function getAllProjects(): Project[] {
	return loadProjects().sort((a, b) => {
		const dateA = a.metadata.startDate ? new Date(a.metadata.startDate).getTime() : 0;
		const dateB = b.metadata.startDate ? new Date(b.metadata.startDate).getTime() : 0;
		return dateB - dateA;
	});
}

// --- Tags ---

export function getAllTags(): Map<string, number> {
	const posts = getAllPosts();
	return posts.reduce((acc, post) => {
		post.metadata.tags?.forEach((tag) => {
			acc.set(tag, (acc.get(tag) || 0) + 1);
		});
		return acc;
	}, new Map<string, number>());
}

export function getSortedTags(): { tag: string; count: number }[] {
	const tagCounts = getAllTags();
	return [...tagCounts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => {
			const countDiff = b.count - a.count;
			return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag);
		});
}

// --- Post lookups ---

export function getPostById(postId: string): BlogPost | null {
	const allPosts = getAllPostsAndSubposts();
	return allPosts.find((post) => post.id === postId) || null;
}

export function getRecentPosts(count: number): BlogPost[] {
	return getAllPosts().slice(0, count);
}

export function getPostsByTag(tag: string): BlogPost[] {
	return getAllPosts().filter((post) => post.metadata.tags?.includes(tag));
}

export function getPostsByAuthor(authorId: string): BlogPost[] {
	return getAllPosts().filter((post) => post.metadata.authors?.includes(authorId));
}

// --- Subpost helpers ---

export function isSubpost(postId: string): boolean {
	return postId.includes('/');
}

export function getParentId(subpostId: string): string {
	return subpostId.split('/')[0];
}

export function getParentPost(subpostId: string): BlogPost | null {
	if (!isSubpost(subpostId)) return null;
	const parentId = getParentId(subpostId);
	const allPosts = getAllPosts();
	return allPosts.find((post) => post.id === parentId) || null;
}

export function getSubpostsForParent(parentId: string): BlogPost[] {
	return loadBlogPosts()
		.filter(
			(post) =>
				!post.metadata.draft && isSubpost(post.id) && getParentId(post.id) === parentId
		)
		.sort((a, b) => {
			const dateDiff =
				new Date(a.metadata.date).valueOf() - new Date(b.metadata.date).valueOf();
			if (dateDiff !== 0) return dateDiff;
			const orderA = a.metadata.order ?? 0;
			const orderB = b.metadata.order ?? 0;
			return orderA - orderB;
		});
}

export function hasSubposts(postId: string): boolean {
	return getSubpostsForParent(postId).length > 0;
}

export function getSubpostCount(parentId: string): number {
	return getSubpostsForParent(parentId).length;
}

// --- Navigation ---

export function getAdjacentPosts(currentId: string): {
	newer: BlogPost | null;
	older: BlogPost | null;
	parent: BlogPost | null;
} {
	if (isSubpost(currentId)) {
		const parentId = getParentId(currentId);
		const parent = getAllPosts().find((p) => p.id === parentId) || null;
		const subposts = getSubpostsForParent(parentId);
		const currentIndex = subposts.findIndex((p) => p.id === currentId);

		if (currentIndex === -1) return { newer: null, older: null, parent };

		return {
			newer: currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
			older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
			parent
		};
	}

	const parentPosts = getAllPosts().filter((p) => !isSubpost(p.id));
	const currentIndex = parentPosts.findIndex((p) => p.id === currentId);

	if (currentIndex === -1) return { newer: null, older: null, parent: null };

	return {
		newer: currentIndex > 0 ? parentPosts[currentIndex - 1] : null,
		older: currentIndex < parentPosts.length - 1 ? parentPosts[currentIndex + 1] : null,
		parent: null
	};
}

// --- Grouping ---

export function groupPostsByYear(posts: BlogPost[]): Record<string, BlogPost[]> {
	return posts.reduce(
		(acc: Record<string, BlogPost[]>, post) => {
			const year = new Date(post.metadata.date).getFullYear().toString();
			(acc[year] ??= []).push(post);
			return acc;
		},
		{}
	);
}

// --- Reading time ---

export function getPostReadingTime(postId: string): string {
	const post = getPostById(postId);
	return post?.metadata.readingTime || readingTime(0);
}

export function getCombinedReadingTime(postId: string): string {
	const post = getPostById(postId);
	if (!post) return readingTime(0);

	// If it's a subpost or has no subposts, return its own reading time
	if (isSubpost(postId) || !hasSubposts(postId)) {
		return post.metadata.readingTime || readingTime(0);
	}

	// Combine parent + subpost reading times
	const parentMinutes = parseInt(post.metadata.readingTime || '1') || 1;
	const subposts = getSubpostsForParent(postId);
	const totalMinutes = subposts.reduce((sum, sub) => {
		return sum + (parseInt(sub.metadata.readingTime || '1') || 1);
	}, parentMinutes);

	return `${totalMinutes} min read`;
}

// --- Authors ---

export function parseAuthors(authorIds: string[] = []): ParsedAuthor[] {
	if (!authorIds.length) return [];

	const allAuthors = getAllAuthors();
	const authorMap = new Map(allAuthors.map((a) => [a.id, a]));

	return authorIds.map((id) => {
		const author = authorMap.get(id);
		return {
			id,
			name: author?.metadata.name || id,
			avatar: author?.metadata.avatar || '/favicon.svg',
			isRegistered: !!author
		};
	});
}

// --- Table of Contents ---

export function getTOCSections(postId: string): TOCSection[] {
	const post = getPostById(postId);
	if (!post) return [];

	const parentId = isSubpost(postId) ? getParentId(postId) : postId;
	const parentPost = isSubpost(postId) ? getPostById(parentId) : post;
	if (!parentPost) return [];

	const sections: TOCSection[] = [];

	// Parent headings
	const parentHeadings = (parentPost.metadata.headings || []) as TOCHeading[];
	if (parentHeadings.length > 0) {
		sections.push({
			type: 'parent',
			title: 'Overview',
			headings: parentHeadings
		});
	}

	// Subpost headings
	const subposts = getSubpostsForParent(parentId);
	for (const subpost of subposts) {
		const subpostHeadings = (subpost.metadata.headings || []) as TOCHeading[];
		if (subpostHeadings.length > 0) {
			sections.push({
				type: 'subpost',
				title: subpost.metadata.title,
				headings: subpostHeadings.map((h, index) => ({
					...h,
					isSubpostTitle: index === 0
				})),
				subpostId: subpost.id
			});
		}
	}

	return sections;
}
