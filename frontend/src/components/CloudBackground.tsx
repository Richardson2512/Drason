export default function CloudBackground() {
    return (
        <div
            className="absolute inset-0"
            style={{
                pointerEvents: 'none',
                background: 'linear-gradient(180deg, #c9e8ff 0%, #e8f4ff 40%, #f0f7ff 70%, #ffffff 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Animated cloud layers using CSS radial gradients */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                        radial-gradient(ellipse 600px 200px at 15% 20%, rgba(255,255,255,0.9) 0%, transparent 70%),
                        radial-gradient(ellipse 500px 150px at 70% 15%, rgba(255,255,255,0.85) 0%, transparent 70%),
                        radial-gradient(ellipse 700px 180px at 40% 35%, rgba(255,255,255,0.8) 0%, transparent 70%),
                        radial-gradient(ellipse 400px 120px at 85% 40%, rgba(255,255,255,0.75) 0%, transparent 70%)
                    `,
                    animation: 'cloud-drift 60s linear infinite',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                        radial-gradient(ellipse 550px 170px at 25% 45%, rgba(255,255,255,0.7) 0%, transparent 70%),
                        radial-gradient(ellipse 650px 190px at 60% 55%, rgba(255,255,255,0.65) 0%, transparent 70%),
                        radial-gradient(ellipse 450px 140px at 80% 25%, rgba(255,255,255,0.6) 0%, transparent 70%)
                    `,
                    animation: 'cloud-drift 80s linear infinite reverse',
                }}
            />
            <style>{`
                @keyframes cloud-drift {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(30px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
