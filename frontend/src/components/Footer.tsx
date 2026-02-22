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
                                <Image src="/image/logo-v2.png" alt="Drason Logo" width={32} height={32} />
                                <span className="text-xl font-bold text-gray-900">Drason</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                Ready to protect your outbound infrastructure? Contact us today to discuss your project and discover how we can bring your vision to life.
                            </p>
                            <p className="text-gray-400 text-xs">
                                ♡ Made with love by the Drason team
                            </p>
                        </div>

                        {/* Right: Navigation & Social */}
                        <div className="flex flex-col items-start lg:items-end gap-6">
                            {/* Navigation Links */}
                            <nav className="flex flex-wrap gap-6 text-sm font-medium text-gray-600">
                                <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                                <Link href="/docs" className="hover:text-gray-900 transition-colors">Documentation</Link>
                                <Link href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
                                <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
                            </nav>

                            {/* Legal Links */}
                            <nav className="flex flex-wrap gap-6 text-sm font-medium text-gray-400">
                                <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms & Conditions</Link>
                            </nav>

                            {/* G2 Review Button */}
                            <a
                                href="https://www.g2.com/contributor/drason-reviews-e69828c5-b59e-4f0e-9e18-244e0697eafe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <span className="text-yellow-500">⭐</span> Review us on G2
                            </a>

                            {/* Social Icons */}
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                    <Linkedin size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} Drason. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
