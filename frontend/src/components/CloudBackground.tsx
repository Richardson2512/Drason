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
                // Sky matches the page background (#F5F8FF)
                skyColor: 0xf5f8ff,
                // Pure white clouds
                cloudColor: 0xffffff,
                // Soft blue-grey shadow under each cloud puff
                cloudShadowColor: 0xd8e0f0,
                // No sun / light source visible
                sunColor: 0x000000,
                sunGlareColor: 0x000000,
                sunlightColor: 0x000000,
                speed: 0.8,
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
