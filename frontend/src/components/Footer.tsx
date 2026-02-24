import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
                {/* White Rounded Card Footer */}
                <div className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-10">

                        {/* Left: Branding */}
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                                <span className="text-xl font-bold text-gray-900">Superkabe</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Ready to protect your outbound infrastructure? Contact us today to discuss your project and discover how we can bring your vision to life.
                            </p>
                            <p className="text-gray-400 text-xs">
                                ♡ Made with love by the Superkabe team
                            </p>
                        </div>

                        {/* Right: Navigation Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 w-full lg:w-auto">

                            {/* Product */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2">Product</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                                    <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                                    <Link href="/docs" className="hover:text-blue-600 transition-colors">Documentation</Link>
                                    <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                                </nav>
                            </div>

                            {/* Resources */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2">Resources</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/email-deliverability-protection" className="hover:text-blue-600 transition-colors">Deliverability Guide</Link>
                                    <Link href="/domain-burnout-prevention-tool" className="hover:text-blue-600 transition-colors">Domain Protection</Link>
                                    <Link href="/sender-reputation-monitoring" className="hover:text-blue-600 transition-colors">Reputation</Link>
                                    <Link href="/automated-domain-healing" className="hover:text-blue-600 transition-colors">Auto-Healing</Link>
                                </nav>
                            </div>

                            {/* Case Studies */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2">Case Studies</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/case-study-bounce-reduction" className="hover:text-blue-600 transition-colors">Bounce Reduction</Link>
                                    <Link href="/case-study-domain-recovery" className="hover:text-blue-600 transition-colors">Domain Recovery</Link>
                                    <Link href="/case-study-infrastructure-protection" className="hover:text-blue-600 transition-colors">Infrastructure</Link>
                                </nav>
                            </div>

                            {/* Company */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-900 mb-2">Company</h4>
                                <nav className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                                    <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                                    <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                                </nav>
                                <a
                                    href="https://www.g2.com/contributor/superkabe-reviews-e69828c5-b59e-4f0e-9e18-244e0697eafe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm w-full"
                                >
                                    <span className="text-yellow-500">⭐</span> Review on G2
                                </a>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Copyright & Entity Anchors */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-xs text-gray-400">
                            © {new Date().getFullYear()} Superkabe. All rights reserved.
                        </div>

                        {/* Entity Links Array (Crawler Pathing) */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <a href="https://www.linkedin.com/company/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">LinkedIn</a>
                            <a href="https://github.com/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">GitHub</a>
                            <a href="https://crunchbase.com/organization/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">Crunchbase</a>
                            <a href="https://producthunt.com/products/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">Product Hunt</a>
                            <a href="https://g2.com/products/superkabe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium">G2</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
