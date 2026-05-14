'use client';

/**
 * Posts feed — fetches /api/linkedin/accounts/:id/posts?type=<kind> with
 * cursor pagination, surfaces an empty state when no rows match, and
 * renders each post in a LinkedIn-flavoured PostCard. Three visual
 * variants land in the card (post / article / repost); thought-
 * leadership posts get a Lightbulb accent on top of the plain-post
 * style.
 *
 * Used by all five account-detail subpages — the only thing that
 * changes is the `kind` prop on PostsFeed, which becomes the `type=`
 * query param.
 *
 * The author's display name and account type are needed for the post
 * card header. The component fetches the account once for those two
 * fields so subpages don't need to pass them in.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Heart, MessageCircle, Repeat2, ExternalLink, Calendar, ArrowUpDown,
    Loader2, FileText, Sparkles, AlertTriangle, BookOpen, Newspaper,
    ChevronRight, Users, Lightbulb,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { TYPE_LABEL, relativeTime, initials } from './AccountHeader';
import type { FeedKind } from './FeedTabsNav';

interface Post {
    id: string;
    post_urn?: string;
    posted_at: string;
    text?: string;
    reaction_count: number;
    comment_count: number;
    share_count: number;
    source: 'live' | 'cache';
    post_kind: 'post' | 'article' | 'repost';
    is_thought_leadership?: boolean;
}

interface PostsResponse {
    items: Post[];
    cursor: string | null;
    served_from: 'live' | 'cache';
    upstream_error?: string;
}

type SortMode = 'recent' | 'reactions' | 'comments';

const EMPTY_COPY: Record<FeedKind, { title: string; body: string }> = {
    all: {
        title: 'No posts yet',
        body: 'This account hasn\'t published anything yet — or Unipile hasn\'t indexed it. Engagement-signal monitoring will activate the moment the first post lands.',
    },
    post: {
        title: 'No standalone posts',
        body: 'No plain posts from this account. Articles, reposts, and thought-leadership pieces live on their own tabs.',
    },
    article: {
        title: 'No articles published',
        body: 'This account hasn\'t published a long-form LinkedIn article in the visible window.',
    },
    repost: {
        title: 'No reposts',
        body: 'This account hasn\'t reshared anyone\'s content in the visible window.',
    },
    thought_leadership: {
        title: 'No thought-leadership posts',
        body: 'A post counts as thought leadership when it\'s a standalone post (not an article or repost), is at least 500 characters, and earned 25 or more reactions. Nothing in the visible window cleared that bar yet.',
    },
};

export default function PostsFeed({
    accountId, kind,
}: {
    accountId: string;
    kind: FeedKind;
}) {
    const [authorName, setAuthorName] = useState<string>('');
    const [authorType, setAuthorType] = useState<string>('CLASSIC');
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [servedFrom, setServedFrom] = useState<'live' | 'cache'>('live');
    const [upstreamError, setUpstreamError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [sortMode, setSortMode] = useState<SortMode>('recent');
    const [search, setSearch] = useState('');

    // Author identity for the post-card header. The account endpoint is
    // also called by AccountHeader on the page above — small payload,
    // and the alternative (lifting state) adds more glue than it saves.
    useEffect(() => {
        let cancelled = false;
        apiClient<{ account: { display_name: string; account_type: string } }>(`/api/linkedin/accounts/${accountId}`)
            .then(d => {
                if (cancelled) return;
                setAuthorName(d.account.display_name);
                setAuthorType(d.account.account_type);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [accountId]);

    const fetchPosts = useCallback(async (reset = false, cursorOverride: string | null = null) => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({ type: kind, limit: '25' });
            if (!reset && cursorOverride) qs.set('cursor', cursorOverride);
            const data = await apiClient<PostsResponse>(`/api/linkedin/accounts/${accountId}/posts?${qs}`);
            if (reset) {
                setPosts(data.items ?? []);
            } else {
                setPosts(prev => [...prev, ...(data.items ?? [])]);
            }
            setCursor(data.cursor);
            setServedFrom(data.served_from === 'cache' ? 'cache' : 'live');
            setUpstreamError(data.upstream_error ?? null);
            setError(null);
        } catch (err: any) {
            // Surface the error honestly — no demo fallback. Operator
            // sees an empty state with a retry button when the live
            // endpoint can't be reached.
            if (reset) {
                setPosts([]);
                setCursor(null);
            }
            setError(err?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [accountId, kind]);

    useEffect(() => {
        setCursor(null);
        setPosts([]);
        fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountId, kind]);

    const sortedPosts = useMemo(() => {
        const filtered = search.trim()
            ? posts.filter(p => (p.text ?? '').toLowerCase().includes(search.toLowerCase()))
            : posts;
        if (sortMode === 'reactions') return [...filtered].sort((a, b) => b.reaction_count - a.reaction_count);
        if (sortMode === 'comments') return [...filtered].sort((a, b) => b.comment_count - a.comment_count);
        return filtered;
    }, [posts, sortMode, search]);

    return (
        <>
            {/* Sort + search */}
            <div className="premium-card flex items-center gap-2 flex-wrap !py-2.5">
                <div className="flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3 text-gray-500" />
                    {/* Sort is client-side, so it operates on the rows
                        currently in memory. Once the operator has paged
                        past the first batch (cursor != null + posts >
                        25), client-side sorting would produce wrong
                        rankings — the highest-reaction post might live
                        on a page we haven't fetched yet. Disable the
                        non-recency options in that state. The "recent"
                        sort always matches server order so it stays on.
                        Switching back to recent re-enables both. */}
                    {(() => {
                        const paginated = cursor !== null || posts.length > 25;
                        return (
                            <select
                                value={sortMode}
                                onChange={e => setSortMode(e.target.value as SortMode)}
                                className="text-[11px] px-2 py-1 rounded-md outline-none bg-white cursor-pointer"
                                style={{ border: '1px solid #D1CBC5' }}
                                title={paginated ? 'Reaction / comment sort is disabled across multiple pages — reset to a single page (clear cursor) to use it.' : undefined}
                            >
                                <option value="recent">Most recent</option>
                                <option value="reactions" disabled={paginated && sortMode !== 'reactions'}>
                                    Most reactions{paginated ? ' (single page only)' : ''}
                                </option>
                                <option value="comments" disabled={paginated && sortMode !== 'comments'}>
                                    Most comments{paginated ? ' (single page only)' : ''}
                                </option>
                            </select>
                        );
                    })()}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search post text…"
                        className="text-[11px] px-2 py-1 rounded-md outline-none bg-white w-56"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    {servedFrom === 'cache' && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md" title={upstreamError ?? ''}>
                            Cached · Unipile unreachable
                        </span>
                    )}
                </div>
            </div>

            {/* Feed */}
            {loading && posts.length === 0 ? (
                <div className="premium-card flex items-center justify-center py-12 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading posts…
                </div>
            ) : error ? (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    <button onClick={() => fetchPosts(true)} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold">Retry</button>
                </div>
            ) : sortedPosts.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-12 text-center">
                    {kind === 'thought_leadership'
                        ? <Lightbulb className="w-7 h-7 text-gray-300 mb-2" />
                        : <FileText className="w-7 h-7 text-gray-300 mb-2" />}
                    <p className="text-sm font-semibold text-gray-900 mb-1">{EMPTY_COPY[kind].title}</p>
                    <p className="text-xs text-gray-500 max-w-sm">{EMPTY_COPY[kind].body}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sortedPosts.map(p => (
                        <PostCard
                            key={p.id}
                            post={p}
                            authorName={authorName}
                            authorType={authorType}
                            accountId={accountId}
                        />
                    ))}
                    {cursor && (
                        <button
                            onClick={() => fetchPosts(false, cursor)}
                            disabled={loading}
                            className="mx-auto px-4 py-2 rounded-lg text-xs font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-50"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            {loading ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1.5" />Loading…</> : 'Load more'}
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

// ── PostCard ─────────────────────────────────────────────────────────────────

/**
 * Variant-aware post card. Visual treatments:
 *
 *   thought-leadership — amber Lightbulb ribbon on top of the plain-post
 *                        style, signalling "this earned signal".
 *   article            — purple "Published an article" ribbon + serif
 *                        hero title block on a violet background.
 *   repost             — green "Reposted this" ribbon + indented quoted
 *                        frame for the borrowed body.
 *   post               — clean LinkedIn card with no ribbon.
 *
 * Entire card is clickable into the engagement drill-down at
 * /accounts/[id]/posts/[postId]. The "Open on LinkedIn" icon stops
 * propagation so the outbound link still works.
 */
function PostCard({ post, authorName, authorType, accountId }: { post: Post; authorName: string; authorType: string; accountId: string }) {
    const total = post.reaction_count + post.comment_count + post.share_count;
    const renderedAuthorName = authorName;
    const renderedAuthorType = authorType;

    const kindMeta = post.is_thought_leadership
        ? { label: 'Thought leadership', icon: <Lightbulb className="w-3 h-3" />, accent: '#B45309', accentBg: '#FFFBEB' }
        : post.post_kind === 'article'
            ? { label: 'Published an article', icon: <Newspaper className="w-3 h-3" />, accent: '#7C3AED', accentBg: '#F5F3FF' }
            : post.post_kind === 'repost'
                ? { label: 'Reposted this', icon: <Repeat2 className="w-3 h-3" />, accent: '#16A34A', accentBg: '#F0FDF4' }
                : null;

    const railColor = post.is_thought_leadership ? '#F59E0B'
        : post.post_kind === 'article' ? '#7C3AED'
        : post.post_kind === 'repost'  ? '#16A34A'
        : undefined;

    return (
        <Link
            href={`/dashboard/linkedin/accounts/${accountId}/posts/${post.id}`}
            className="block no-underline group"
        >
            <article
                className="premium-card !p-0 overflow-hidden transition-colors group-hover:bg-[#FAFAF8] cursor-pointer"
                style={{ borderLeft: railColor ? `3px solid ${railColor}` : undefined }}
            >
                {kindMeta && (
                    <div
                        className="px-4 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold"
                        style={{ background: kindMeta.accentBg, color: kindMeta.accent, borderBottom: '1px solid #E8E3DC' }}
                    >
                        {kindMeta.icon}
                        <span>{kindMeta.label}</span>
                    </div>
                )}

                <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0">
                        {initials(renderedAuthorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{renderedAuthorName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <span>{TYPE_LABEL[renderedAuthorType] ?? renderedAuthorType}</span>
                            <span>·</span>
                            <Calendar className="w-3 h-3" />
                            <span>{relativeTime(post.posted_at)}</span>
                            {post.source === 'cache' && <span className="text-amber-700">· cached</span>}
                        </div>
                    </div>
                    {post.post_urn && (
                        <a
                            href={`https://www.linkedin.com/feed/update/${post.post_urn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                            title="Open on LinkedIn"
                            onClick={e => e.stopPropagation()}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>

                {post.text && post.post_kind === 'article' && (
                    <div
                        className="mx-4 mb-3 rounded-lg px-4 py-4"
                        style={{ background: '#F5F3FF', border: '1px solid #E9D5FF' }}
                    >
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-violet-700">
                            <BookOpen className="w-3 h-3" /> Article
                        </div>
                        <h3
                            className="text-base font-bold text-gray-900 leading-snug"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                        >
                            {post.text.split('\n')[0]}
                        </h3>
                        {post.text.includes('\n') && (
                            <p className="text-xs text-gray-700 mt-2 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                                {post.text.split('\n').slice(1).join('\n')}
                            </p>
                        )}
                    </div>
                )}

                {post.text && post.post_kind === 'repost' && (
                    <div className="px-4 pb-3">
                        <div
                            className="rounded-lg pl-3 pr-3 py-2.5"
                            style={{ borderLeft: '3px solid #16A34A', background: '#F0FDF4' }}
                        >
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                        </div>
                    </div>
                )}

                {post.text && post.post_kind === 'post' && (
                    <div className="px-4 pb-3">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                    </div>
                )}

                <div
                    className="px-4 py-2.5 flex items-center justify-between text-[11px]"
                    style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}
                >
                    <div className="flex items-center gap-3 text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <Heart className="w-3 h-3 text-rose-500" />
                            <span className="tabular-nums">{post.reaction_count.toLocaleString()}</span>
                            <span className="text-gray-400">reactions</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MessageCircle className="w-3 h-3 text-blue-500" />
                            <span className="tabular-nums">{post.comment_count.toLocaleString()}</span>
                            <span className="text-gray-400">comments</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Repeat2 className="w-3 h-3 text-emerald-500" />
                            <span className="tabular-nums">{post.share_count.toLocaleString()}</span>
                            <span className="text-gray-400">reposts</span>
                        </span>
                    </div>
                    {total > 0 ? (
                        <span className="flex items-center gap-1.5 text-blue-600 font-semibold group-hover:text-blue-800">
                            <Users className="w-3 h-3" />
                            View engagers
                            <ChevronRight className="w-3 h-3" />
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                            <Sparkles className="w-3 h-3" /> No engagement yet
                        </span>
                    )}
                </div>
            </article>
        </Link>
    );
}
