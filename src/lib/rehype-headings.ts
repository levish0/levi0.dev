import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import type { Root, Element } from 'hast';

export function rehypeHeadings() {
	return function (tree: Root, file: { data: { fm?: Record<string, unknown> } }) {
		const headings: { slug: string; text: string; depth: number }[] = [];

		visit(tree, 'element', (node: Element) => {
			const match = node.tagName.match(/^h([2-6])$/);
			if (!match) return;

			const depth = Number.parseInt(match[1], 10);
			const slug = (node.properties?.id as string) || '';
			const text = toString(node);

			if (slug && text) {
				headings.push({ slug, text, depth });
			}
		});

		file.data.fm ??= {};
		file.data.fm.headings = headings;
	};
}
