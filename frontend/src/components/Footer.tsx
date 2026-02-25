import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="relative z-10 py-20 md:py-24 px-6">
            <div className="max-w-6xl mx-auto">
                {/* White Rounded Card Footer */}
                <div className="bg-white rounded-[2rem] p-12 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12 lg:gap-16">

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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">

                            {/* Platform */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Platform</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                                    <Link href="/product" className="hover:text-blue-600 transition-colors">Product Hub</Link>
                                    <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                                    <Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link>
                                </nav>
                            </div>

                            {/* Product Guides */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Product Guides</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/product/email-deliverability-protection" className="hover:text-blue-600 transition-colors">Deliverability Guide</Link>
                                    <Link href="/product/domain-burnout-prevention-tool" className="hover:text-blue-600 transition-colors">Domain Protection</Link>
                                    <Link href="/product/sender-reputation-monitoring" className="hover:text-blue-600 transition-colors">Reputation</Link>
                                    <Link href="/product/automated-domain-healing" className="hover:text-blue-600 transition-colors">Auto-Healing</Link>
                                </nav>
                            </div>

                            {/* Case Studies */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Product Case Studies</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/product/case-study-bounce-reduction" className="hover:text-blue-600 transition-colors">Bounce Reduction</Link>
                                    <Link href="/product/case-study-domain-recovery" className="hover:text-blue-600 transition-colors">Domain Recovery</Link>
                                    <Link href="/product/case-study-infrastructure-protection" className="hover:text-blue-600 transition-colors">Infrastructure</Link>
                                </nav>
                            </div>

                            {/* Company */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2 text-base">Company</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                                    <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                                </nav>
                                <a
                                    href="https://www.g2.com/contributor/superkabe-reviews-e69828c5-b59e-4f0e-9e18-244e0697eafe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 mt-2 bg-[#FF492C] text-white rounded-full text-xs font-semibold hover:bg-[#e03d24] transition-colors shadow-sm w-full whitespace-nowrap"
                                >
                                    <span>⭐</span><span>Review on G2</span>
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
