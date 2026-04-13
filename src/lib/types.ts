import type { Component } from 'svelte';

export type Site = {
	title: string;
	description: string;
	href: string;
	author: string;
	locale: string;
	featuredPostCount: number;
	postsPerPage: number;
};

export type NavLink = {
	href: string;
	label: string;
};

export type SocialLink = {
	href: string;
	label: string;
};

export type BlogPostMetadata = {
	title: string;
	description: string;
	date: string;
	order?: number;
	image?: string;
	tags?: string[];
	authors?: string[];
	draft?: boolean;
	readingTime?: string;
	headings?: TOCHeading[];
};

export type BlogPost = {
	id: string;
	metadata: BlogPostMetadata;
	component: Component;
};

export type AuthorMetadata = {
	name: string;
	pronouns?: string;
	avatar: string;
	bio?: string;
	mail?: string;
	website?: string;
	twitter?: string;
	github?: string;
	linkedin?: string;
	discord?: string;
};

export type Author = {
	id: string;
	metadata: AuthorMetadata;
	component: Component;
};

export type ProjectMetadata = {
	name: string;
	description: string;
	tags: string[];
	image: string;
	link: string;
	startDate?: string;
	endDate?: string;
};

export type Project = {
	id: string;
	metadata: ProjectMetadata;
	component: Component;
};

export type TOCHeading = {
	slug: string;
	text: string;
	depth: number;
	isSubpostTitle?: boolean;
};

export type TOCSection = {
	type: 'parent' | 'subpost';
	title: string;
	headings: TOCHeading[];
	subpostId?: string;
};

export type ParsedAuthor = {
	id: string;
	name: string;
	avatar: string;
	isRegistered: boolean;
};
