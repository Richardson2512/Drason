'use client';

import { useEffect, useRef } from 'react';

export default function CloudBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const vantaRef = useRef<any>(null);

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
                // Light blue sky — white clouds need a blue background to be visible
                skyColor: 0xc9e8ff,
                // Pure white clouds
                cloudColor: 0xffffff,
                // Slightly deeper blue shadow under each cloud puff
                cloudShadowColor: 0x89b8d8,
                // No visible sun or light source
                sunColor: 0x000000,
                sunGlareColor: 0x000000,
                sunlightColor: 0x000000,
                speed: 0.6,
                zoom: 1.0,
            });
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
            style={{ pointerEvents: 'none' }}
        />
    );
}
