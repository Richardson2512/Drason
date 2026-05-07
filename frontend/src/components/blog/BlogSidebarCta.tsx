import Image from 'next/image';
import Link from 'next/link';

export default function BlogSidebarCta() {
    return (
        <div className="mt-8 space-y-3">
            <Link
                href="/signup"
                className="block bg-[#1C4532] text-[#F7F2EB] p-5 transition-colors hover:bg-[#143324] group"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Image
                        src="/image/logo-v2.png"
                        alt="Superkabe"
                        width={20}
                        height={20}
                        className="rounded-sm bg-[#F7F2EB] p-0.5"
                    />
                    <span className="text-[11px] tracking-[0.08em] font-semibold uppercase text-[#EADFCE]">Try Superkabe</span>
                </div>
                <p className="text-sm font-bold leading-snug mb-1">Stop burning domains.</p>
                <p className="text-xs text-[#EADFCE] leading-snug mb-4">AI sequences + auto-pause + 5-phase healing. 14-day free trial.</p>
                <span className="text-xs font-semibold text-[#F7F2EB] group-hover:underline">Start free trial &rarr;</span>
            </Link>

            <Link
                href="/tools"
                className="block bg-[#F7F2EB] border border-[#1C4532]/15 text-[#1C4532] p-5 transition-colors hover:bg-[#EADFCE] group"
            >
                <div className="flex items-center gap-2 mb-3">
                    <Image
                        src="/image/logo-v2.png"
                        alt="Superkabe"
                        width={20}
                        height={20}
                    />
                    <span className="text-[11px] tracking-[0.08em] font-semibold uppercase text-[#1C4532]/70">Free tools</span>
                </div>
                <p className="text-sm font-bold leading-snug mb-1">SPF, DKIM, DMARC checks.</p>
                <p className="text-xs text-[#1C4532]/70 leading-snug mb-4">Free deliverability tools. No login required.</p>
                <span className="text-xs font-semibold text-[#1C4532] group-hover:underline">Open free tools &rarr;</span>
            </Link>
        </div>
    );
}
