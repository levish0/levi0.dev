import adapter from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { remarkReadingTime } from './src/lib/remark-reading-time.ts';
import { rehypeHeadings } from './src/lib/rehype-headings.ts';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: [
		'javascript',
		'typescript',
		'svelte',
		'html',
		'css',
		'json',
		'bash',
		'shell',
		'markdown',
		'python',
		'rust',
		'go',
		'yaml',
		'toml',
		'sql',
		'cpp',
		'c',
		'java',
		'diff'
	]
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkMath, remarkReadingTime],
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: 'wrap' }],
				[
					rehypeExternalLinks,
					{ target: '_blank', rel: ['nofollow', 'noreferrer', 'noopener'] }
				],
				rehypeKatex,
				rehypeHeadings
			],
			highlight: {
				highlighter: async (code, lang) => {
					const html = highlighter.codeToHtml(code, {
						lang: lang || 'text',
						themes: { light: 'github-light', dark: 'github-dark' }
					});
					// Escape curly braces for Svelte
					return `{@html \`${html.replace(/`/g, '\\`').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')}\`}`;
				}
			}
		})
	],
	compilerOptions: {
		runes: ({ filename }) => {
			if (!filename) return true;
			const parts = filename.split(/[/\\]/);
			if (parts.includes('node_modules')) return undefined;
			// mdsvex-generated .md files don't support runes
			if (filename.endsWith('.md')) return undefined;
			return true;
		}
	},
	kit: { adapter: adapter() }
};

export default config;
