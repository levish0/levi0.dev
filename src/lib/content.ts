import type { Component } from 'svelte';
import type { BlogPost, BlogPostMetadata, Author, AuthorMetadata, Project, ProjectMetadata } from '$lib/types';

type MdsvexModule = {
	default: Component;
	metadata: Record<string, unknown>;
};

// Eager glob imports at build time
const blogGlob = import.meta.glob<MdsvexModule>('/src/content/blog/**/*.md', { eager: true });
const authorsGlob = import.meta.glob<MdsvexModule>('/src/content/authors/*.md', { eager: true });
const projectsGlob = import.meta.glob<MdsvexModule>('/src/content/projects/*.md', { eager: true });

function extractBlogId(path: string): string {
	// /src/content/blog/hello-world/index.md -> hello-world
	// /src/content/blog/parent/child.md -> parent/child
	// /src/content/blog/standalone.md -> standalone
	const relative = path.replace('/src/content/blog/', '').replace(/\.md$/, '');

	// If it ends with /index, strip the /index
	if (relative.endsWith('/index')) {
		return relative.replace(/\/index$/, '');
	}
	return relative;
}

function extractId(path: string, prefix: string): string {
	return path.replace(prefix, '').replace(/\.md$/, '');
}

export function loadBlogPosts(): BlogPost[] {
	return Object.entries(blogGlob).map(([path, mod]) => ({
		id: extractBlogId(path),
		metadata: mod.metadata as unknown as BlogPostMetadata,
		component: mod.default
	}));
}

export function loadAuthors(): Author[] {
	return Object.entries(authorsGlob).map(([path, mod]) => ({
		id: extractId(path, '/src/content/authors/'),
		metadata: mod.metadata as unknown as AuthorMetadata,
		component: mod.default
	}));
}

export function loadProjects(): Project[] {
	return Object.entries(projectsGlob).map(([path, mod]) => ({
		id: extractId(path, '/src/content/projects/'),
		metadata: mod.metadata as unknown as ProjectMetadata,
		component: mod.default
	}));
}
