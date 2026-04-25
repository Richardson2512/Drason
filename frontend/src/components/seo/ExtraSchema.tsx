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
 * Emits supplementary schema.org blocks that complement BlogPosting /
 * TechArticle. For AEO: HowTo and ItemList are preferentially surfaced in
 * rich results for step-by-step guides and ranked lists respectively.
 */
export function HowToJsonLd({ data }: { data: HowToSchemaData }) {
    if (!data?.steps?.length) return null;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: data.name,
        description: data.description,
        step: data.steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
        })),
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
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
