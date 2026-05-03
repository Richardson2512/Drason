'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, List, ListOrdered, Undo, Redo, Code, Image as ImageIcon, PenLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { preserveBlankLines } from '@/lib/preserveBlankLines';

interface Signature {
    id: string;
    name: string;
    html_content: string;
    is_default: boolean;
}

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    personalizationTokens?: string[];
    signatures?: Signature[];
    enableImages?: boolean;
}

interface AutocompleteState {
    show: boolean;
    position: { top: number; left: number };
    query: string;
    triggerFrom: number; // position of the first `{{` character
    selectedIndex: number;
}

export default function RichTextEditor({ content, onChange, placeholder, personalizationTokens = [], signatures, enableImages = false }: RichTextEditorProps) {
    // When `signatures` prop is not passed (e.g. inside the signature editor itself),
    // hide the Insert Signature button entirely — it would be nonsensical.
    const signatureInsertEnabled = signatures !== undefined;
    const signatureList = signatures || [];
    const containerRef = useRef<HTMLDivElement>(null);
    const signatureMenuRef = useRef<HTMLDivElement>(null);
    const variableMenuRef = useRef<HTMLDivElement>(null);
    const [showSignatureMenu, setShowSignatureMenu] = useState(false);
    const [showVariableMenu, setShowVariableMenu] = useState(false);

    // Close dropdowns on outside click
    useEffect(() => {
        if (!showSignatureMenu && !showVariableMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (showSignatureMenu && signatureMenuRef.current && !signatureMenuRef.current.contains(target)) {
                setShowSignatureMenu(false);
            }
            if (showVariableMenu && variableMenuRef.current && !variableMenuRef.current.contains(target)) {
                setShowVariableMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSignatureMenu, showVariableMenu]);
    const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
        show: false,
        position: { top: 0, left: 0 },
        query: '',
        triggerFrom: 0,
        selectedIndex: 0,
    });

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline' },
            }),
            Underline,
            Image.configure({
                HTMLAttributes: { style: 'max-width: 100%; height: auto;' },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write your email...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            // Canonical write path: normalize Tiptap's emit so user-intended
            // blank lines (which Tiptap stores as <p></p> / <p><br></p> /
            // <p>text<br></p>) become <p>&nbsp;</p> — the only form that
            // renders with visible height in browsers, email clients, and
            // every preview surface.
            //
            // Idempotent: re-emitting the same HTML produces the same output.
            // Tiptap's internal state stays raw; only what we hand to the
            // parent (and ultimately to storage) is normalized.
            onChange(preserveBlankLines(editor.getHTML()));
            checkAutocomplete();
        },
        onSelectionUpdate: () => {
            checkAutocomplete();
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[calc(100vh-480px)] px-3 py-2',
            },
        },
    });

    // Check if cursor is after `{{` and show autocomplete
    const checkAutocomplete = useCallback(() => {
        if (!editor) return;
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 50), from, '\n');

        // Look for {{ that hasn't been closed with }}
        const match = textBefore.match(/\{\{([a-zA-Z0-9_]*)$/);
        if (match) {
            const query = match[1];
            const triggerFrom = from - match[0].length;

            // Get cursor coordinates
            const coords = editor.view.coordsAtPos(from);
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (containerRect) {
                setAutocomplete({
                    show: true,
                    position: {
                        top: coords.bottom - containerRect.top + 4,
                        left: coords.left - containerRect.left,
                    },
                    query,
                    triggerFrom,
                    selectedIndex: 0,
                });
            }
        } else {
            setAutocomplete(prev => prev.show ? { ...prev, show: false } : prev);
        }
    }, [editor]);

    // Filtered tokens based on query
    const filteredTokens = personalizationTokens.filter(t =>
        t.toLowerCase().includes(autocomplete.query.toLowerCase())
    );

    // Insert token by replacing `{{query` with `{{token}}`
    const insertTokenFromAutocomplete = useCallback((token: string) => {
        if (!editor) return;
        const { from } = editor.state.selection;
        editor.chain()
            .focus()
            .deleteRange({ from: autocomplete.triggerFrom, to: from })
            .insertContent(`{{${token}}} `)
            .run();
        setAutocomplete(prev => ({ ...prev, show: false }));
    }, [editor, autocomplete.triggerFrom]);

    // Keyboard navigation
    useEffect(() => {
        if (!autocomplete.show || !editor) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!autocomplete.show) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAutocomplete(prev => ({
                    ...prev,
                    selectedIndex: Math.min(prev.selectedIndex + 1, filteredTokens.length - 1),
                }));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAutocomplete(prev => ({
                    ...prev,
                    selectedIndex: Math.max(prev.selectedIndex - 1, 0),
                }));
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                if (filteredTokens[autocomplete.selectedIndex]) {
                    e.preventDefault();
                    insertTokenFromAutocomplete(filteredTokens[autocomplete.selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setAutocomplete(prev => ({ ...prev, show: false }));
            }
        };

        const editorDom = editor.view.dom as HTMLElement;
        editorDom.addEventListener('keydown', handleKeyDown, true);
        return () => editorDom.removeEventListener('keydown', handleKeyDown, true);
    }, [autocomplete.show, autocomplete.selectedIndex, filteredTokens, editor, insertTokenFromAutocomplete]);

    // Sync external content changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const insertToken = useCallback((token: string) => {
        if (!editor) return;
        editor.chain().focus().insertContent(`{{${token}}}`).run();
    }, [editor]);

    const insertSignature = useCallback((signature: Signature) => {
        if (!editor) return;
        // Empty paragraph forces a real blank line above the signature in
        // TipTap (a bare <br/> would get absorbed by the preceding paragraph
        // when followed by a block-level element). No horizontal rule —
        // matches modern email client behavior (Gmail / Outlook / Apple
        // Mail) and keeps cold sends looking personal rather than templated.
        editor.chain().focus().insertContent(`<p></p>${signature.html_content}`).run();
        setShowSignatureMenu(false);
    }, [editor]);

    const insertImage = useCallback(() => {
        if (!editor) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be under 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const src = ev.target?.result as string;
                if (src) editor.chain().focus().setImage({ src }).run();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }, [editor]);

    if (!editor) return null;

    return (
        <div ref={containerRef} className="border rounded-lg overflow-hidden relative" style={{ borderColor: '#D1CBC5' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b flex-wrap" style={{ borderColor: '#E8E3DC', background: '#FAFAF8' }}>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Bold"
                ><Bold size={14} /></ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Italic"
                ><Italic size={14} /></ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Underline"
                ><UnderlineIcon size={14} /></ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                ><Strikethrough size={14} /></ToolbarButton>

                <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />

                <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
                    <LinkIcon size={14} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet list"
                ><List size={14} /></ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered list"
                ><ListOrdered size={14} /></ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    title="Inline code"
                ><Code size={14} /></ToolbarButton>

                <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />

                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo size={14} />
                </ToolbarButton>

                {/* Image upload (for signature editor) */}
                {enableImages && (
                    <>
                        <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />
                        <ToolbarButton onClick={insertImage} title="Insert image">
                            <ImageIcon size={14} />
                        </ToolbarButton>
                    </>
                )}

                {/* Spintax helper — inserts a sample {a|b|c} block at the cursor.
                    The send pipeline resolves spintax per-recipient so each lead
                    sees a different variant; breaks ISP pattern fingerprinting. */}
                <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().insertContent('{Hi|Hey|Hello}').run()}
                    className="text-[10px] px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-colors hover:bg-[#E8E3DC]"
                    style={{ border: '1px solid #D1CBC5', color: '#6B7280' }}
                    title="Insert spintax — {a|b|c} rotates per recipient to break spam-filter pattern matching"
                >
                    {`{a|b|c}`} Spintax
                </button>

                {/* Personalization token dropdown */}
                {personalizationTokens.length > 0 && (
                    <>
                        <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />
                        <div ref={variableMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowVariableMenu(v => !v)}
                                className="text-[10px] px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-colors hover:bg-[#E8E3DC]"
                                style={{ border: '1px solid #D1CBC5', color: '#6B7280' }}
                            >
                                {`{ }`} Insert variable
                            </button>
                            {showVariableMenu && (
                                <div
                                    className="absolute top-full left-0 mt-1 bg-white overflow-y-auto max-h-[200px] scrollbar-hide z-50"
                                    style={{ border: '1px solid #D1CBC5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: '160px' }}
                                >
                                    {personalizationTokens.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => {
                                                insertToken(t);
                                                setShowVariableMenu(false);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-[10px] cursor-pointer transition-colors hover:bg-[#F5F1EA] text-gray-700 bg-transparent border-none"
                                            style={{ borderBottom: '1px solid #F0EBE3' }}
                                        >
                                            {`{{${t}}}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Insert Signature dropdown — only when caller opts in by passing `signatures` */}
                {signatureInsertEnabled && (
                <>
                <div className="w-px h-4 mx-1" style={{ background: '#D1CBC5' }} />
                <div ref={signatureMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setShowSignatureMenu(v => !v)}
                        className="text-[10px] px-2 py-1 rounded-md cursor-pointer flex items-center gap-1 transition-colors hover:bg-[#E8E3DC]"
                        style={{ border: '1px solid #D1CBC5', color: '#6B7280' }}
                    >
                        <PenLine size={11} /> Insert signature
                    </button>
                    {showSignatureMenu && (
                        <div
                            className="absolute top-full right-0 mt-1 bg-white overflow-y-auto max-h-[280px] z-50"
                            style={{ border: '1px solid #D1CBC5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', minWidth: '240px' }}
                        >
                            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b" style={{ borderColor: '#F0EBE3', background: '#FAFAF8' }}>
                                {signatureList.length > 0 ? 'Choose signature' : 'No signatures yet'}
                            </div>
                            {signatureList.length > 0 ? (
                                signatureList.map(s => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => insertSignature(s)}
                                        className="w-full text-left px-3 py-2 cursor-pointer transition-colors hover:bg-[#F5F1EA] bg-transparent border-none"
                                        style={{ borderBottom: '1px solid #F0EBE3' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-900">{s.name}</span>
                                            {s.is_default && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">DEFAULT</span>}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1 line-clamp-2 overflow-hidden" dangerouslySetInnerHTML={{ __html: s.html_content.replace(/<[^>]*>/g, '').slice(0, 100) }} />
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-3">
                                    <p className="text-[10px] text-gray-500 mb-2">Create signatures with logo, name, contact info to insert them into any email.</p>
                                    <a
                                        href="/dashboard/sequencer/templates"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Create your first signature →
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </>
                )}
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* ── Inline variable autocomplete (triggered by typing {{) ── */}
            {autocomplete.show && filteredTokens.length > 0 && (
                <div
                    className="absolute bg-white overflow-y-auto max-h-[200px] z-50"
                    style={{
                        top: `${autocomplete.position.top}px`,
                        left: `${autocomplete.position.left}px`,
                        border: '1px solid #D1CBC5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        minWidth: '180px',
                    }}
                >
                    <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b" style={{ borderColor: '#F0EBE3', background: '#FAFAF8' }}>
                        Variables
                    </div>
                    {filteredTokens.map((t, idx) => (
                        <button
                            key={t}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent editor blur
                                insertTokenFromAutocomplete(t);
                            }}
                            onMouseEnter={() => setAutocomplete(prev => ({ ...prev, selectedIndex: idx }))}
                            className="w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors"
                            style={{
                                background: idx === autocomplete.selectedIndex ? '#F5F1EA' : 'transparent',
                                color: '#111827',
                            }}
                        >
                            <span className="font-mono text-[11px]">{`{{${t}}}`}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ToolbarButton({ children, onClick, active, title }: { children: React.ReactNode; onClick: () => void; active?: boolean; title?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="w-7 h-7 flex items-center justify-center rounded cursor-pointer transition-colors"
            style={{
                background: active ? '#E8E3DC' : 'transparent',
                color: active ? '#111827' : '#6B7280',
            }}
        >
            {children}
        </button>
    );
}
