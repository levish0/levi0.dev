import type { Site, NavLink, SocialLink } from '$lib/types';

export const SITE: Site = {
	title: 'levi0.dev',
	description: 'Personal blog and portfolio by Levi.',
	href: 'https://levi0.dev',
	author: 'levi',
	locale: 'en-US',
	featuredPostCount: 2,
	postsPerPage: 5
};

export const NAV_LINKS: NavLink[] = [
	{ href: '/blog', label: 'blog' },
	{ href: '/authors', label: 'authors' },
	{ href: '/about', label: 'about' }
];

export const SOCIAL_LINKS: SocialLink[] = [
	{ href: 'https://github.com/levish0', label: 'GitHub' },
	{ href: 'mailto:hello@levi0.dev', label: 'Email' },
	{ href: '/rss.xml', label: 'RSS' }
];
