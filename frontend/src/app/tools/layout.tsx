'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, Search, Settings, Shield, Key, Lock, Wrench } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const toolItems = [
 { title: 'All Tools', href: '/tools', icon: Wrench },
 { title: 'SPF Record Lookup', href: '/tools/spf-lookup', icon: Search },
 { title: 'SPF Record Generator', href: '/tools/spf-generator', icon: Settings },
 { title: 'DKIM Record Lookup', href: '/tools/dkim-lookup', icon: Search },
 { title: 'DKIM Record Generator', href: '/tools/dkim-generator', icon: Key },
 { title: 'DMARC Record Lookup', href: '/tools/dmarc-lookup', icon: Search },
 { title: 'DMARC Record Generator', href: '/tools/dmarc-generator', icon: Shield },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
 const [showScrollTop, setShowScrollTop] = useState(false);
 const [sidebarOffsetY, setSidebarOffsetY] = useState(0);
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const pathname = usePathname();

 const handleScroll = useCallback(() => {
 setShowScrollTop(window.scrollY > 300);
 const footer = document.querySelector('footer');
 if (!footer) return;
 const footerTop = footer.getBoundingClientRect().top;
 const vh = window.innerHeight;
 setSidebarOffsetY(footerTop < vh ? vh - footerTop : 0);
 }, []);

 useEffect(() => {
 window.addEventListener('scroll', handleScroll, { passive: true });
 handleScroll();
 return () => window.removeEventListener('scroll', handleScroll);
 }, [handleScroll]);

 useEffect(() => { setSidebarOpen(false); }, [pathname]);

 const isToolsIndex = pathname === '/tools';

 if (isToolsIndex) {
 return <>{children}</>;
 }

 return (
 <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans overflow-x-hidden">
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
 { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com" },
 { "@type": "ListItem", "position": 2, "name": "Free Tools", "item": "https://www.superkabe.com/tools" }
 ]
 })
 }}
 />

 <Navbar />

 <div className="fixed inset-0 pointer-events-none z-0">
 <div className="cloud-bg">
 <div className="cloud-shadow" />
 <div className="cloud-puff-1" />
 <div className="cloud-puff-2" />
 <div className="cloud-puff-3" />
 </div>
 <div className="absolute inset-0 hero-grid"></div>
 </div>

 <div className="relative z-10 pt-32 md:pt-36 pb-8">
 <div className="flex items-start">
 {/* Desktop Sidebar */}
 <aside
 className="hidden lg:block fixed top-32 left-6 w-72 bg-white/70 backdrop-blur-md border border-white/30 overflow-y-auto scrollbar-hide shadow-xl shadow-gray-200/50 z-30"
 style={{ maxHeight: 'calc(100vh - 9rem)', transform: `translateY(-${sidebarOffsetY}px)` }}
 >
 <div className="p-6">
 <div className="mb-6 pb-4 border-b border-gray-100">
 <Link href="/tools" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
 ← All Free Tools
 </Link>
 </div>
 <nav className="space-y-1">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
 DNS Tools
 </h3>
 {toolItems.slice(1).map((item) => (
 <ToolNavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
 ))}
 </nav>

 <div className="mt-8 p-4 bg-blue-50 border border-blue-100">
 <p className="text-xs text-blue-800 font-medium mb-2">Need continuous monitoring?</p>
 <p className="text-xs text-blue-600 mb-3">Superkabe checks SPF, DKIM, and DMARC across all your sending domains automatically.</p>
 <Link
 href="/signup"
 className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
 >
 Start free trial
 </Link>
 </div>
 </div>
 </aside>

 {/* Mobile Sidebar */}
 <aside className={`
 fixed top-32 left-6 h-[calc(100vh-10rem)] w-72 bg-white/70 backdrop-blur-md border border-white/30 overflow-y-auto
 transition-transform duration-300 z-40 shadow-xl shadow-gray-200/50 lg:hidden
 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}
 `}>
 <div className="p-6">
 <div className="mb-6 pb-4 border-b border-gray-100">
 <Link href="/tools" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
 ← All Free Tools
 </Link>
 </div>
 <nav className="space-y-1">
 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">DNS Tools</h3>
 {toolItems.slice(1).map((item) => (
 <ToolNavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
 ))}
 </nav>
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 lg:ml-80 px-6 lg:px-12">
 <div className="max-w-4xl py-4 lg:py-6">
 {children}
 </div>
 </main>
 </div>
 </div>

 <Footer />

 {sidebarOpen && (
 <div className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
 )}

 {showScrollTop && (
 <button
 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
 className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white rounded-full shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
 aria-label="Scroll to top"
 >
 <ChevronUp size={24} />
 </button>
 )}
 </div>
 );
}

function ToolNavItem({ href, title, icon: Icon, onClick }: { href: string; title: string; icon: any; onClick: () => void }) {
 const pathname = usePathname();
 const isActive = pathname === href;

 return (
 <Link
 href={href}
 onClick={onClick}
 className={`flex items-center gap-3 px-3 py-2 transition-all duration-200
 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
 >
 <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
 <span className="text-sm">{title}</span>
 </Link>
 );
}
