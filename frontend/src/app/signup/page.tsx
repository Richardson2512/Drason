'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Import styles from sibling directory (we can copy the file or just reference if in same dir)
// Since we are in /signup, we can actually import from ../login/auth.module.css if we want to share
// But standard Next.js might prefer colocated css. 
// For simplicity, I will assume we can import from the relative path or I'll just copy the file content if needed.
// IMPORTANT: CSS Modules in Next.js usually need to be in the same directory or strictly typed.
// I will reuse the styles from login by importing relatively.
import styles from '../login/auth.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, organizationName: orgName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            const data = await res.json();

            // Set cookie for middleware
            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Background Blobs */}
            <div className={styles.blobContainer}>
                <div className={`${styles.blob} ${styles.blobPurple}`}></div>
                <div className={`${styles.blob} ${styles.blobOrange}`}></div>
            </div>

            <div className={styles.authCard}>
                <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                    <div style={{ width: '24px', height: '24px', background: '#252432', borderRadius: '6px' }}></div>
                    Drason
                </Link>

                <h1 className={styles.title}>Get Started</h1>
                <p className={styles.subtitle}>Create your Drason account</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Organization Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="Acme Corp"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}
