import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="relative z-10 py-10 md:py-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* White Rounded Card Footer */}
                <div className="bg-white rounded-[2rem] p-12 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.6fr] gap-12 lg:gap-16">

                        {/* Left: Branding */}
                        <div>
                            <div className="flex items-center gap-2 mb-5">
                                <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                                <span className="text-xl font-bold text-gray-900">Superkabe</span>
                            </div>
                            <p className="text-gray-500 text-base leading-relaxed mb-6">
                                Ready to protect your outbound infrastructure? Contact us today to discuss your project and discover how we can bring your vision to life.
                            </p>
                            <p className="text-gray-400 text-xs">
                                ♡ Made with love by the Superkabe team
                            </p>
                        </div>

                        {/* Right: Navigation Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">

                            {/* Platform */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Platform</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Home</Link>
                                    <Link href="/product" className="hover:text-blue-600 transition-colors whitespace-nowrap">Product Hub</Link>
                                    <Link href="/pricing" className="hover:text-blue-600 transition-colors whitespace-nowrap">Pricing</Link>
                                    <Link href="/docs" className="hover:text-blue-600 transition-colors whitespace-nowrap">Documentation</Link>
                                </nav>
                            </div>

                            {/* Free Tools */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Free Tools</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/tools/spf-lookup" className="hover:text-blue-600 transition-colors whitespace-nowrap">SPF Lookup</Link>
                                    <Link href="/tools/spf-generator" className="hover:text-blue-600 transition-colors whitespace-nowrap">SPF Generator</Link>
                                    <Link href="/tools/dkim-lookup" className="hover:text-blue-600 transition-colors whitespace-nowrap">DKIM Lookup</Link>
                                    <Link href="/tools/dkim-generator" className="hover:text-blue-600 transition-colors whitespace-nowrap">DKIM Generator</Link>
                                    <Link href="/tools/dmarc-lookup" className="hover:text-blue-600 transition-colors whitespace-nowrap">DMARC Lookup</Link>
                                    <Link href="/tools/dmarc-generator" className="hover:text-blue-600 transition-colors whitespace-nowrap">DMARC Generator</Link>
                                </nav>
                            </div>

                            {/* Product Guides */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Product Guides</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/product/email-deliverability-protection" className="hover:text-blue-600 transition-colors whitespace-nowrap">Deliverability Guide</Link>
                                    <Link href="/product/domain-burnout-prevention-tool" className="hover:text-blue-600 transition-colors whitespace-nowrap">Domain Protection</Link>
                                    <Link href="/product/sender-reputation-monitoring" className="hover:text-blue-600 transition-colors whitespace-nowrap">Reputation</Link>
                                    <Link href="/product/automated-domain-healing" className="hover:text-blue-600 transition-colors whitespace-nowrap">Auto-Healing</Link>
                                </nav>
                            </div>

                            {/* Case Studies */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Case Studies</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/product/case-study-bounce-reduction" className="hover:text-blue-600 transition-colors whitespace-nowrap">Bounce Reduction</Link>
                                    <Link href="/product/case-study-domain-recovery" className="hover:text-blue-600 transition-colors whitespace-nowrap">Domain Recovery</Link>
                                    <Link href="/product/case-study-infrastructure-protection" className="hover:text-blue-600 transition-colors whitespace-nowrap">Infrastructure</Link>
                                </nav>
                            </div>

                            {/* Company */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Company</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/contact" className="hover:text-blue-600 transition-colors whitespace-nowrap">Contact Us</Link>
                                    <Link href="/release-notes" className="hover:text-blue-600 transition-colors whitespace-nowrap">Release Notes</Link>
                                    <Link href="/privacy" className="hover:text-blue-600 transition-colors whitespace-nowrap">Privacy Policy</Link>
                                    <Link href="/terms" className="hover:text-blue-600 transition-colors whitespace-nowrap">Terms of Service</Link>
                                </nav>
                                <a
                                    href="https://www.g2.com/contributor/superkabe-reviews-e69828c5-b59e-4f0e-9e18-244e0697eafe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mt-3 bg-[#FF492C] text-white rounded-full text-xs font-semibold hover:bg-[#e03d24] transition-colors shadow-sm whitespace-nowrap w-fit"
                                >
                                    <span className="text-sm">⭐</span><span>Review on G2</span>
                                </a>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Copyright & Entity Anchors */}
                    <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-xs text-gray-400">
                            © {new Date().getFullYear()} Superkabe. All rights reserved.
                        </div>

                        {/* Entity Links Array (Crawler Pathing) */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <a href="https://www.linkedin.com/company/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">LinkedIn</a>
                            <a href="https://github.com/Superkabereal/Superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">GitHub</a>
                            <a href="https://www.crunchbase.com/organization/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">Crunchbase</a>
                            <a href="https://producthunt.com/products/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">Product Hunt</a>
                            <a href="https://g2.com/products/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">G2</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
