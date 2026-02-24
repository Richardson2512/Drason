const fs = require('fs');
const path = require('path');

const PRODUCT_DIR = path.join(__dirname, '..', 'src', 'app', 'product');

const PREAMBLE_HTML = `<div className="max-w-4xl mx-auto mb-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <p className="text-lg text-blue-900 leading-relaxed font-medium">
                                <strong className="text-blue-950">Superkabe</strong> is an email deliverability and sender reputation protection platform designed for outbound email infrastructure. We protect your domains from burnout by monitoring bounce rates, blocking toxic leads, and auto-healing your infrastructure before mailbox providers can penalize your sender score.
                            </p>
                        </div>`;

const NEW_NAVBAR = `{/* ================= NAVBAR ================= */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/product" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-4 items-center">
                        <Link href="/login" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>`;

const processDirectory = (dirPath) => {
    const pages = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const page of pages) {
        if (page.isDirectory()) {
            const pagePath = path.join(dirPath, page.name, 'page.tsx');
            if (fs.existsSync(pagePath)) {
                let content = fs.readFileSync(pagePath, 'utf8');

                // 1. Ensure imports
                if (!content.includes("import Footer from")) {
                     content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Footer from '@/components/Footer';");
                }
                if (!content.includes("import Image from")) {
                     content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
                }

                // 2. Inject Preamble right after Hero H1/P text block and before the CTA buttons
                if (!content.includes("Superkabe is an email deliverability and sender reputation")) {
                     content = content.replace(
                        /(<p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">[\s\S]*?<\/p>)/,
                        `$1\n\n                        ${PREAMBLE_HTML}`
                     );
                }

                // 3. Rip out the old simple navbar and replace with the global homepage navbar
                const navMatch = content.match(/{\/\* ================= NAVBAR ================= \*\/}[\s\S]*?<\/header>/);
                if (navMatch) {
                     content = content.replace(navMatch[0], NEW_NAVBAR);
                }

                // 4. Ensure Footer component is at the bottom
                if (!content.includes("<Footer />")) {
                     content = content.replace(
                        /(<\/div>\n\s*?\n\s*?}\);?\n?)$/,
                        `\n            <Footer />\n$1`
                     );
                     content = content.replace(/<footer className="py-12 px-6 border-t border-gray-100 text-center text-gray-500 text-sm">[\s\S]*?<\/footer>/, "");
                }

                fs.writeFileSync(pagePath, content);
                console.log(`Processed ${page.name}`);
            }
        }
    }
};

processDirectory(PRODUCT_DIR);
