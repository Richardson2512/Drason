import React from 'react';

export interface Crumb {
    name: string;
    url: string;
}

/**
 * BreadcrumbList JSON-LD for AEO. Emits only the schema — the visible
 * breadcrumb is up to the consuming page.
 */
export default function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
    if (!crumbs || crumbs.length === 0) return null;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.url,
        })),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
