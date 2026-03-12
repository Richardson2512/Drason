'use client';
import Image from 'next/image';

const PROVIDERS = [
    { key: 'smartlead', label: 'Smartlead', icon: '/smartlead.webp', active: true },
    { key: 'instantly', label: 'Instantly', icon: '/instantly.png', active: true },
    { key: 'emailbison', label: 'EmailBison', icon: '/emailbison.png', active: true },
    { key: 'replyio', label: 'Reply.io', icon: '/replyio.png', active: false },
] as const;

export default function IntegrationSelector({
    activeIntegration,
    onSelect,
}: {
    activeIntegration: string;
    onSelect: (key: string) => void;
}) {
    return (
        <div className="flex gap-2 flex-wrap">
            {PROVIDERS.map(provider => {
                const isActive = activeIntegration === provider.key;
                return (
                    <button
                        key={provider.key}
                        onClick={() => onSelect(provider.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm cursor-pointer transition-all duration-200 ${
                            isActive
                                ? 'border-2 border-blue-600 bg-blue-50 text-blue-800 font-bold'
                                : 'border border-slate-200 bg-white text-slate-500 font-medium'
                        }`}
                    >
                        {provider.icon && <Image src={provider.icon} alt={provider.label} width={18} height={18} />}
                        {provider.label}
                        {!provider.active && (
                            <span className="text-[0.6rem] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-semibold">SOON</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
