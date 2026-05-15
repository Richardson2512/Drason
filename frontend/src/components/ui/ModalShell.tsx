'use client';

/**
 * Shared modal shell for the entire dashboard.
 *
 * Every modal in the app uses this so we get five guarantees with no
 * per-modal repetition:
 *
 *   1. Portals to `document.body`. Modals must escape any ancestor
 *      with `transform`, `filter`, `will-change`, `contain`, or a
 *      stacking context that would otherwise bound `position: fixed`
 *      to the content column. Portaling also ensures the backdrop
 *      visibly covers the sidebar.
 *   2. Full-viewport overlay at `z-[9999]` over a dim + slight blur.
 *      The sidebar (z-20) and sticky headers (z-30) sit underneath,
 *      so they appear darkened AND become unclickable.
 *   3. Click-outside + ESC both close (unless the consumer disables
 *      via `dismissible={false}`).
 *   4. Page scroll is locked while open so the underlying dashboard
 *      can't be scrolled by accident.
 *   5. Consistent `rounded-2xl` corner radius, off-stone border, and
 *      shadow - matches the rest of the premium-card vocabulary.
 *
 * The shell is *layout-only*. Consumers supply their own header /
 * body / footer markup as children, exactly the way they did before.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalShellProps {
    /** Controls visibility - `false` returns null (no portal). */
    open: boolean;
    /** Fired when the backdrop is clicked or ESC is pressed. */
    onClose?: () => void;
    /** Tailwind max-width class. Defaults to `max-w-2xl`. */
    maxWidth?: string;
    /** Override the backdrop click + ESC dismissal (e.g. during a
     *  network-bound submit you don't want the user to abort). */
    dismissible?: boolean;
    /** Padding around the modal card (controls how close to the
     *  viewport edges on small screens). */
    padding?: string;
    /** Optional class on the inner card for layout overrides. */
    cardClassName?: string;
    children: React.ReactNode;
}

export default function ModalShell({
    open,
    onClose,
    maxWidth = 'max-w-2xl',
    dismissible = true,
    padding = 'p-4',
    cardClassName = '',
    children,
}: ModalShellProps) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && dismissible && onClose) onClose();
        };
        window.addEventListener('keydown', onKey);
        // Lock body scroll while a modal is open so the page beneath
        // doesn't drift when the user scrolls inside the modal.
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose, dismissible]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center ${padding}`}
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => { if (dismissible && onClose) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`w-full ${maxWidth} bg-white rounded-2xl flex flex-col overflow-hidden ${cardClassName}`}
                style={{
                    border: '1px solid #D1CBC5',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
                    maxHeight: '90vh',
                }}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}
