import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Product Platform | Superkabe',
    description: 'Explore the complete Superkabe deliverability protection platform, covering infrastructure monitoring, DNS healing, and domain recovery.',
    alternates: {
        canonical: '/product',
    },
};

export default function ProductIndexPage() {
    const categories = [
        {
            title: 'Master Documentation & Playbooks',
            links: [
                { title: 'The Infrastructure Playbook', href: '/infrastructure-playbook', desc: 'The authoritative, highly detailed A-Z guide on setting up, protecting, and scaling outbound deliverability. Start here.' },
            ]
        },
        {
            title: 'Core Platform & Infrastructure',
            links: [
                { title: 'Email Deliverability Protection', href: '/product/email-deliverability-protection', desc: 'Complete overview of our deliverability protection layer.' },
                { title: 'Outbound Domain Protection', href: '/product/outbound-domain-protection', desc: 'Secure your outbound sender domains from hard bounces.' },
                { title: 'Email Infrastructure Health Check', href: '/product/email-infrastructure-health-check', desc: 'Continuous DNS health and reputation monitoring.' },
                { title: 'Cold Email Infrastructure Protection', href: '/product/cold-email-infrastructure-protection', desc: 'Designed for high-volume cold email scaling.' },
                { title: 'Outbound Email Infrastructure Monitoring', href: '/product/outbound-email-infrastructure-monitoring', desc: 'Real-time SMTP block and bounce detection.' },
                { title: 'Email Infrastructure Protection', href: '/product/email-infrastructure-protection', desc: 'The baseline protection system for your agency.' },
            ]
        },
        {
            title: 'Bounce & Reputation Management',
            links: [
                { title: 'Sender Reputation Protection Tool', href: '/product/sender-reputation-protection-tool', desc: 'Track and shield sender identity profiles.' },
                { title: 'B2B Sender Reputation Management', href: '/product/b2b-sender-reputation-management', desc: 'Enterprise reputation recovery and scaling.' },
                { title: 'Sender Reputation Monitoring', href: '/product/sender-reputation-monitoring', desc: 'Live reputation scoring from major inbox providers.' },
                { title: 'Bounce Rate Protection System', href: '/product/bounce-rate-protection-system', desc: 'Stop campaigns before bounce caps are hit.' },
                { title: 'Automated Bounce Management', href: '/product/automated-bounce-management', desc: 'Webhook-driven bounce isolation.' },
                { title: 'How to Protect Sender Reputation', href: '/product/how-to-protect-sender-reputation', desc: 'Actionable steps to safeguard deliverability.' },
                { title: 'What is Email Deliverability Protection', href: '/product/what-is-email-deliverability-protection', desc: 'Learn the fundamentals of DPL engineering.' },
            ]
        },
        {
            title: 'Domain Risk & Auto-Healing',
            links: [
                { title: 'Domain Burnout Prevention Tool', href: '/product/domain-burnout-prevention-tool', desc: 'Forecast and stop domain burnout before it strikes.' },
                { title: 'How to Prevent Domain Burnout', href: '/product/how-to-prevent-domain-burnout', desc: 'Best practices for sustainable warmups.' },
                { title: 'Automated Domain Healing', href: '/product/automated-domain-healing', desc: 'Auto-pausing and traffic distribution algorithms.' },
            ]
        },
        {
            title: 'Platform Integrations',
            links: [
                { title: 'Smartlead Deliverability Protection', href: '/product/smartlead-deliverability-protection', desc: 'Native Smartlead webhook and API sync.' },
                { title: 'Smartlead Infrastructure Protection', href: '/product/smartlead-infrastructure-protection', desc: 'Protect Smartlead campaigns from cascading bans.' },
                { title: 'Instantly Infrastructure Protection', href: '/product/instantly-infrastructure-protection', desc: 'Deep integration for Instantly.ai operators.' },
                { title: 'Reply.io Deliverability Protection', href: '/product/reply-io-deliverability-protection', desc: 'Protect Reply.io outreach and sequences.' },
                { title: 'EmailBison Infrastructure Protection', href: '/product/emailbison-infrastructure-protection', desc: 'Secure your EmailBison infrastructure layer.' },
                { title: 'Multi-platform Outbound Protection', href: '/product/multi-platform-outbound-protection', desc: 'Agnostic protection across all sending CRMs.' },
            ]
        },
        {
            title: 'Product Case Studies',
            links: [
                { title: 'Bounce Reduction Case Study', href: '/product/case-study-bounce-reduction', desc: 'How an agency cut bounces to 0.1%.' },
                { title: 'Domain Recovery Case Study', href: '/product/case-study-domain-recovery', desc: 'Recovering 40 burned domains in 14 days.' },
                { title: 'Infrastructure Protection Case Study', href: '/product/case-study-infrastructure-protection', desc: 'Scaling to 100k sends/day safely.' },
            ]
        }
    ];

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] overflow-hidden font-sans min-h-screen flex flex-col pt-32">

            {/* Header / Nav Area placeholder block - utilizing shared Navbar if desired, otherwise simple nav */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/product" className="text-black font-semibold transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto px-6 w-full mb-20 z-10">
                <div className="text-center mb-16 mt-10">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        Product Hub
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Explore the complete Superkabe deliverability protection ecosystem. Everything you need to scale outbound infrastructure predictably.
                    </p>
                </div>

                <div className="space-y-16">
                    {categories.map((category) => (
                        <section key={category.title}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                                {category.title}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.links.map((link) => (
                                    <Link key={link.href} href={link.href} className="group block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-100 transition-all duration-300">
                                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {link.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {link.desc}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
