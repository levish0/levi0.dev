import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';

export function remarkReadingTime() {
	return function (tree: Root, file: { data: { fm?: Record<string, unknown> } }) {
		const text = toString(tree);
		const wordCount = text.split(/\s+/).filter(Boolean).length;
		const minutes = Math.max(1, Math.round(wordCount / 200));
		if (!file.data.fm) file.data.fm = {};
		file.data.fm.readingTime = `${minutes} min read`;
	};
}
