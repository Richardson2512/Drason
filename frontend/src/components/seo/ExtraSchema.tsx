import React from 'react';

export interface HowToStep {
    name: string;
    text: string;
}

export interface HowToSchemaData {
    name: string;
    description?: string;
    steps: HowToStep[];
}

export interface ItemListSchemaData {
    name: string;
    description?: string;
    items: { name: string; url?: string }[];
}

/**
 * Supplementary schema.org blocks that complement BlogPosting / TechArticle.
 *
 * NOTE on HowTo: Google deprecated HowTo rich results in Sept 2023 — they're
 * now restricted to Android-related content. The component below is preserved
 * as an inert no-op so existing call sites don't break, but it intentionally
 * renders nothing. Use the page's narrative content + ItemList for ranked
 * step content; the AEO/citation benefit comes from clean H2 + H3 structure
 * inside the page body, not from HowTo JSON-LD.
 */
export function HowToJsonLd(_props: { data: HowToSchemaData }) {
    return null;
}

export function ItemListJsonLd({ data }: { data: ItemListSchemaData }) {
    if (!data?.items?.length) return null;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: data.name,
        description: data.description,
        itemListElement: data.items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            ...(item.url ? { url: item.url } : {}),
        })),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
