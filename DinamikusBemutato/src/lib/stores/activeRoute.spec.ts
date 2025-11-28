import { describe, it, expect } from 'vitest';
import { matchHref, computeActiveSets } from './activeRoute';
import type { SidebarNode } from '$lib/types/sidebar';

describe('matchHref', () => {
	it('should return exact for identical paths', () => {
		const url = new URL('https://example.com/tananyag');
		const result = matchHref('/tananyag', url);
		expect(result).toBe('exact');
	});

	it('should return ancestor when current path is child of target', () => {
		const url = new URL('https://example.com/tananyag/chapter1');
		const result = matchHref('/tananyag', url);
		expect(result).toBe('ancestor');
	});

	it('should return none for completely different paths', () => {
		const url = new URL('https://example.com/tananyag');
		const result = matchHref('/profile', url);
		expect(result).toBe('none');
	});
});

describe('computeActiveSets', () => {
	it('should mark active child and ancestor parent', () => {
		const nodes: SidebarNode[] = [
			{
				id: 'parent',
				label: 'Parent',
				href: '/parent',
				children: [
					{ id: 'child1', label: 'Child 1', href: '/parent/child1' }
				]
			}
		];

		const url = new URL('https://example.com/parent/child1');
		const result = computeActiveSets(nodes, url);

		expect(result.active.has('child1')).toBe(true);
		expect(result.ancestors.has('parent')).toBe(true);
	});

	it('should mark all ancestors in deep hierarchy', () => {
		const nodes: SidebarNode[] = [
			{
				id: 'level1',
				label: 'Level 1',
				href: '/level1',
				children: [
					{
						id: 'level2',
						label: 'Level 2',
						href: '/level1/level2',
						children: [
							{
								id: 'level3',
								label: 'Level 3',
								href: '/level1/level2/level3'
							}
						]
					}
				]
			}
		];

		const url = new URL('https://example.com/level1/level2/level3');
		const result = computeActiveSets(nodes, url);

		expect(result.active.has('level3')).toBe(true);
		expect(result.ancestors.has('level1')).toBe(true);
		expect(result.ancestors.has('level2')).toBe(true);
	});
});
