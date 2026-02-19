'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        apiClient<any>('/api/user/me').then(response => {
            const user = response.data || response;
            if (user?.name) { setName(user.name); setOriginalName(user.name); }
            if (user?.email) setEmail(user.email);
        }).catch(() => { });
    }, []);

    const handleSaveName = async () => {
        if (!name.trim()) return;
        setNameLoading(true);
        setNameMessage(null);
        try {
            const res = await apiClient<any>('/api/user/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (res?.success) {
                setOriginalName(name.trim());
                setNameMessage({ type: 'success', text: 'Name updated successfully' });
            } else {
                setNameMessage({ type: 'error', text: res?.error || 'Failed to update name' });
            }
        } catch {
            setNameMessage({ type: 'error', text: 'Failed to update name' });
        } finally {
            setNameLoading(false);
            setTimeout(() => setNameMessage(null), 4000);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMessage(null);
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'All fields are required' });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setPasswordLoading(true);
        try {
            const res = await apiClient<any>('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res?.success) {
                setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMessage({ type: 'error', text: res?.error || 'Failed to change password' });
            }
        } catch {
            setPasswordMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setPasswordLoading(false);
            setTimeout(() => setPasswordMessage(null), 4000);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        borderRadius: '10px',
        border: '1px solid #D1D5DB',
        outline: 'none',
        transition: 'all 0.2s',
        background: '#FAFBFC',
        color: '#111827',
        fontFamily: 'inherit',
    };

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '640px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Profile</h1>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '2rem' }}>Manage your account details and security</p>

            {/* Name Section */}
            <div style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Personal Information</h2>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email</label>
                    <div style={{ ...inputStyle, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }}>{email}</div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                        placeholder="Enter your full name"
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                {nameMessage && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1rem',
                        background: nameMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                        color: nameMessage.type === 'success' ? '#166534' : '#991B1B',
                        border: `1px solid ${nameMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`
                    }}>
                        {nameMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {nameMessage.text}
                    </div>
                )}

                <button
                    onClick={handleSaveName}
                    disabled={nameLoading || name.trim() === originalName}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                        background: name.trim() === originalName ? '#E5E7EB' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        color: name.trim() === originalName ? '#9CA3AF' : '#fff',
                        opacity: nameLoading ? 0.7 : 1,
                    }}
                >
                    <Save size={14} />
                    {nameLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Password Section */}
            <div style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={16} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Change Password</h2>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Enter current password"
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} placeholder="At least 8 characters"
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Repeat new password"
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                </div>

                {passwordMessage && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, marginBottom: '1rem',
                        background: passwordMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                        color: passwordMessage.type === 'success' ? '#166534' : '#991B1B',
                        border: `1px solid ${passwordMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`
                    }}>
                        {passwordMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {passwordMessage.text}
                    </div>
                )}

                <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                        background: (!currentPassword || !newPassword || !confirmPassword) ? '#E5E7EB' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                        color: (!currentPassword || !newPassword || !confirmPassword) ? '#9CA3AF' : '#fff',
                        opacity: passwordLoading ? 0.7 : 1,
                    }}
                >
                    <Lock size={14} />
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
            </div>
        </div>
    );
}
