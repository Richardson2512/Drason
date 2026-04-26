'use client';

/**
 * Mailivery-style sticky Table of Contents (left sidebar).
 *
 * Auto-extracts h2 and h3 elements from the page, groups h3s under their
 * parent h2, and renders the Mailivery visual pattern:
 *   - "Table of Contents" header
 *   - Each item prefixed with → arrow
 *   - h3 children indented under their parent h2
 *   - Thin horizontal divider after each h2 group
 *   - Active heading highlighted as the user scrolls
 *
 * Used by the centered Mailivery-style post variant. Sits in the left
 * column of a 2-column grid; main article content is to its right.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface TocItem {
    id: string;
    text: string;
    level: 2 | 3;
}

interface TocGroup {
    parent: TocItem;
    children: TocItem[];
}

function slugify(text: string, idx: number): string {
    const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return slug || `heading-${idx}`;
}

export default function MaileveryToc() {
    const [groups, setGroups] = useState<TocGroup[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const pathname = usePathname();

    // Discover headings + assign IDs
    useEffect(() => {
        const findHeadings = () => {
            const article = document.querySelector('article');
            if (!article) return;

            const elements = article.querySelectorAll('h2, h3');
            const flat: TocItem[] = [];

            elements.forEach((el, idx) => {
                if (!el.id) {
                    el.id = slugify(el.textContent || '', idx);
                }
                flat.push({
                    id: el.id,
                    text: el.textContent || '',
                    level: el.tagName === 'H2' ? 2 : 3,
                });
            });

            // Group h3s under their parent h2
            const grouped: TocGroup[] = [];
            let current: TocGroup | null = null;
            for (const item of flat) {
                if (item.level === 2) {
                    current = { parent: item, children: [] };
                    grouped.push(current);
                } else if (current) {
                    current.children.push(item);
                }
            }

            setGroups(grouped);
        };

        const t = setTimeout(findHeadings, 50);
        return () => clearTimeout(t);
    }, [pathname]);

    // Track active heading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '-100px 0px -70% 0px' }
        );

        groups.forEach((g) => {
            const parentEl = document.getElementById(g.parent.id);
            if (parentEl) observer.observe(parentEl);
            g.children.forEach((c) => {
                const el = document.getElementById(c.id);
                if (el) observer.observe(el);
            });
        });

        return () => observer.disconnect();
    }, [groups]);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const offset = 100;
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    if (groups.length === 0) return null;

    return (
        <nav className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>

            <ul className="space-y-0">
                {groups.map((g, idx) => {
                    const isLast = idx === groups.length - 1;
                    return (
                        <li key={g.parent.id}>
                            {/* Parent (h2) */}
                            <button
                                onClick={() => scrollTo(g.parent.id)}
                                className="group flex items-start gap-3 w-full text-left py-3 transition-colors"
                            >
                                <span className="text-gray-700 group-hover:text-gray-900 mt-0.5 shrink-0 select-none">→</span>
                                <span
                                    className={`text-sm leading-snug ${
                                        activeId === g.parent.id
                                            ? 'text-gray-900 font-semibold'
                                            : 'text-gray-700 group-hover:text-gray-900'
                                    }`}
                                >
                                    {g.parent.text}
                                </span>
                            </button>

                            {/* Children (h3) */}
                            {g.children.length > 0 && (
                                <ul className="pl-7 mb-2">
                                    {g.children.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                onClick={() => scrollTo(c.id)}
                                                className="group flex items-start gap-2 w-full text-left py-2 transition-colors"
                                            >
                                                <span className="text-gray-500 group-hover:text-gray-800 mt-0.5 shrink-0 select-none">→</span>
                                                <span
                                                    className={`text-sm leading-snug ${
                                                        activeId === c.id
                                                            ? 'text-gray-900 font-semibold'
                                                            : 'text-gray-600 group-hover:text-gray-900'
                                                    }`}
                                                >
                                                    {c.text}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Divider between h2 groups */}
                            {!isLast && <hr className="border-0 border-t border-gray-200 my-1" />}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
