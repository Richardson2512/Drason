import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Personalization, Conditionals & Fallbacks | Superkabe Docs',
    description: 'Use merge tags, {{#if}} conditional blocks, comparison operators, and fallback values to personalize cold email sequences per lead. Smartlead-compatible syntax.',
    alternates: { canonical: '/docs/personalization' },
    openGraph: {
        title: 'Personalization, Conditionals & Fallbacks | Superkabe Docs',
        description: 'Merge tags, conditional blocks, comparison operators, and fallback values for cold email personalization.',
        url: '/docs/personalization',
        siteName: 'Superkabe',
        type: 'article',
    },
};

function Code({ children }: { children: React.ReactNode }) {
    return <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-[13px] rounded">{children}</code>;
}

export default function PersonalizationDocsPage() {
    return (
        <div className="prose prose-lg max-w-none">
            <h1 className="text-5xl font-semibold mb-6 text-gray-900">Personalization, Conditionals &amp; Fallbacks</h1>
            <p className="text-xl text-gray-500 mb-12">
                Write one template that adapts to every lead - merge tags, conditional blocks, comparison operators, and graceful fallbacks.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What you can do</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Every sequence step (subject, preheader, and body) is rendered per lead at send time. You can drop in a
                lead field, branch the copy on a field&apos;s value, and supply a fallback for leads whose data is missing.
                The syntax is compatible with Smartlead&apos;s, so existing templates paste in unchanged.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
                Rendering runs <strong>before</strong> spintax and tracking, so a chosen conditional branch can itself
                contain a <Link href="/docs/sequencer-overview" className="text-blue-600 hover:underline">spintax</Link> block.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Merge tags</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Reference a lead field with double braces. A missing field renders as an empty string.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">Hi {`{{first_name}}`}, I saw {`{{company}}`} is hiring.</pre>
            <p className="text-gray-600 leading-relaxed mb-4">
                Built-in tags: <Code>{`{{first_name}}`}</Code>, <Code>{`{{last_name}}`}</Code>, <Code>{`{{full_name}}`}</Code>,{' '}
                <Code>{`{{company}}`}</Code>, <Code>{`{{title}}`}</Code>, <Code>{`{{email}}`}</Code>, <Code>{`{{website}}`}</Code>,{' '}
                <Code>{`{{signal_icebreaker}}`}</Code>. Any extra column in your CSV import becomes a tag too (e.g. a
                column named <Code>industry</Code> becomes <Code>{`{{industry}}`}</Code>).
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Fallbacks - never send &quot;Hey ,&quot;</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                When a field might be empty, give it a fallback so the line still reads cleanly.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">Hey {`{{first_name | fallback: "there"}}`},</pre>
            <p className="text-gray-600 leading-relaxed mb-4">
                Renders <Code>Hey Jane,</Code> when the lead has a first name, and <Code>Hey there,</Code> when they don&apos;t.
                Quotes are optional and spacing is flexible.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Conditional blocks</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Show different copy based on a lead&apos;s data with an <Code>{`{{#if}}`}</Code> block. The{' '}
                <Code>{`{{else}}`}</Code> branch is optional, and blocks can be nested.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">{`{{#if first_name}}Hey {{first_name}},{{else}}Hey there,{{/if}}`}</pre>
            <p className="text-gray-600 leading-relaxed mb-4">
                With no operator, <Code>{`{{#if field}}`}</Code> is true when the field is present and non-empty - the same
                effect as a fallback, with full control over both branches.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Comparison operators</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Branch on a field&apos;s value using an operator. The operator may be quoted (as Smartlead writes it) or bare.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">{`{{#if title '==' "founder"}}As the founder, you...{{/if}}
{{#if google_review 'gte' 4}}Congrats on the {{google_review}}-star rating!{{/if}}
{{#if number_of_reviews '<' 15}}You've got {{number_of_reviews}} reviews so far...{{/if}}`}</pre>
            <div className="bg-blue-50 border border-blue-200 p-6 my-8 not-prose">
                <h3 className="font-bold text-blue-900 text-base mb-3">Supported operators</h3>
                <ul className="text-blue-800 text-sm space-y-1.5">
                    <li><Code>==</Code> and <Code>!=</Code> - equal / not equal (case-insensitive text match)</li>
                    <li><Code>&gt;</Code> <Code>&lt;</Code> <Code>&gt;=</Code> <Code>&lt;=</Code> - numeric when both sides are numbers, otherwise alphabetical</li>
                    <li><Code>gte</Code> and <Code>lte</Code> - word forms of <Code>&gt;=</Code> and <Code>&lt;=</Code></li>
                </ul>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Inserting from the editor</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                In the sequence editor toolbar, use <strong>Insert variable</strong> for merge tags, <strong>Fallback</strong>{' '}
                for a default value, and <strong>Condition</strong> for an <Code>{`{{#if}}`}</Code> block. Type{' '}
                <Code>{`{{`}</Code> anywhere to autocomplete a field name.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">What happens if a template is malformed</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                Superkabe validates personalization syntax when you save a sequence or campaign. An unclosed{' '}
                <Code>{`{{#if}}`}</Code>, a stray <Code>{`{{else}}`}</Code>, or an unparseable condition is rejected with a
                clear message pointing at the step and field, so a broken template can never reach a live send.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Migrating from Smartlead</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
                The <Code>{`{{#if field '==' "value"}}`}</Code> conditional and operator syntax matches Smartlead&apos;s, so
                templates copied from a Smartlead campaign render the same way here. See the{' '}
                <Link href="/docs/migration/from-smartlead" className="text-blue-600 hover:underline">Smartlead migration guide</Link>.
            </p>
        </div>
    );
}
