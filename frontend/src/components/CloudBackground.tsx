'use client';

import { useEffect, useRef, useState } from 'react';

export default function CloudBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const vantaRef = useRef<any>(null);
    const [vantaReady, setVantaReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || vantaRef.current) return;

        let cancelled = false;

        // Defer Three.js loading until after the page is fully interactive.
        // This keeps LCP/FCP/TBT clean — the CSS gradient placeholder shows instantly,
        // then 3D clouds fade in once the browser is idle.
        const scheduleLoad = (cb: () => void) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(cb, { timeout: 4000 });
            } else {
                setTimeout(cb, 3000);
            }
        };

        scheduleLoad(async () => {
            if (cancelled || !containerRef.current) return;

            try {
                const THREE = await import('three');
                // @ts-ignore — vanta has no official TS types
                const { default: CLOUDS } = await import('vanta/dist/vanta.clouds.min');

                if (cancelled || !containerRef.current) return;

                vantaRef.current = CLOUDS({
                    el: containerRef.current,
                    THREE,
                    skyColor: 0xc9e8ff,
                    cloudColor: 0xffffff,
                    cloudShadowColor: 0x89b8d8,
                    sunColor: 0x000000,
                    sunGlareColor: 0x000000,
                    sunlightColor: 0x000000,
                    speed: 0.5,
                    scale: 5,
                    scaleMobile: 8,
                    mouseControls: false,
                    touchControls: false,
                    gyroControls: false,
                });

                if (!cancelled) setVantaReady(true);
            } catch (err) {
                // If Three.js fails to load, CSS gradient fallback stays visible
                console.warn('[CloudBackground] Failed to load 3D clouds, using CSS fallback', err);
            }
        });

        return () => {
            cancelled = true;
            if (vantaRef.current) {
                vantaRef.current.destroy();
                vantaRef.current = null;
            }
        };
    }, []);

    return (
        <div className="absolute inset-0" style={{ pointerEvents: 'none', overflow: 'hidden' }}>
            {/* CSS gradient placeholder — renders instantly, no JS needed */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, #c9e8ff 0%, #e8f4ff 40%, #f0f7ff 70%, #ffffff 100%)',
                    opacity: vantaReady ? 0 : 1,
                    transition: 'opacity 1s ease',
                }}
            />

            {/* Three.js canvas container — fades in once loaded */}
            <div
                ref={containerRef}
                className="absolute inset-0"
                style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    opacity: vantaReady ? 1 : 0,
                    transition: 'opacity 1s ease',
                }}
            />
        </div>
    );
}
