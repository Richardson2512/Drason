'use client';

import { useEffect, useRef, useState } from 'react';

export default function CloudBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const vantaRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || vantaRef.current) return;

        let cancelled = false;

        (async () => {
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
                // scale controls render resolution: devicePixelRatio / scale.
                // Higher = fewer pixels rendered = significantly less GPU load.
                scale: 5,
                scaleMobile: 8,
                // Disable mouse/touch tracking — saves per-frame event overhead
                mouseControls: false,
                touchControls: false,
                gyroControls: false,
            });

            if (!cancelled) setReady(true);
        })();

        return () => {
            cancelled = true;
            if (vantaRef.current) {
                vantaRef.current.destroy();
                vantaRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0"
            style={{
                pointerEvents: 'none',
                willChange: 'transform',
                transform: 'translateZ(0)',
                opacity: ready ? 1 : 0,
                transition: 'opacity 0.6s ease',
            }}
        />
    );
}
