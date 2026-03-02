'use client';

import { useEffect, useRef, useState } from 'react';

export default function CloudBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const vantaRef = useRef<any>(null);
    const [frozenImage, setFrozenImage] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || vantaRef.current) return;

        let cancelled = false;

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

                // Let the clouds render for 3 seconds, then freeze + destroy WebGL
                setTimeout(() => {
                    if (cancelled || !containerRef.current) return;

                    const canvas = containerRef.current.querySelector('canvas');
                    if (canvas) {
                        try {
                            const dataUrl = canvas.toDataURL('image/webp', 0.85);
                            setFrozenImage(dataUrl);
                        } catch {
                            // toDataURL can fail in some contexts — keep live render
                            return;
                        }
                    }

                    // Destroy Vanta + Three.js — frees GPU, stops render loop
                    if (vantaRef.current) {
                        vantaRef.current.destroy();
                        vantaRef.current = null;
                    }
                }, 3000);
            } catch (err) {
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
            {/* CSS gradient placeholder — renders instantly */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, #c9e8ff 0%, #e8f4ff 40%, #f0f7ff 70%, #ffffff 100%)',
                    opacity: frozenImage ? 0 : 1,
                    transition: 'opacity 1s ease',
                }}
            />

            {/* Three.js renders here, then gets destroyed after freeze */}
            <div
                ref={containerRef}
                className="absolute inset-0"
                style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    opacity: frozenImage ? 0 : 1,
                    transition: 'opacity 0.5s ease',
                }}
            />

            {/* Frozen screenshot of the 3D clouds — zero ongoing cost */}
            {frozenImage && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${frozenImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 1,
                    }}
                />
            )}
        </div>
    );
}
