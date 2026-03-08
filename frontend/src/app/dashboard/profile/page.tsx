'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

export default function ProfilePage() {
    const { user, refetchUser } = useDashboard();
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
        if (user) {
            if (user.name) { setName(user.name); setOriginalName(user.name); }
            if (user.email) setEmail(user.email);
        }
    }, [user]);

    const handleSaveName = async () => {
        if (!name.trim()) return;
        setNameLoading(true);
        setNameMessage(null);
        try {
            const res = await apiClient<{ success: boolean; error?: string }>('/api/user/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (res?.success) {
                setOriginalName(name.trim());
                setNameMessage({ type: 'success', text: 'Name updated successfully' });
                refetchUser();
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
            const res = await apiClient<{ success: boolean; error?: string }>('/api/user/change-password', {
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

    const nameUnchanged = name.trim() === originalName;
    const passwordIncomplete = !currentPassword || !newPassword || !confirmPassword;

    return (
        <div className="px-4 py-8 max-w-[1200px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
            <p className="text-sm text-gray-500 mb-8">Manage your account details and security</p>

            <div className="flex flex-wrap gap-8 items-start">
                {/* Left Column */}
                <div className="flex-[1_1_500px] max-w-[640px]">

                    {/* Name Section */}
                    <div className="profile-card mb-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)' }}>
                                <User size={16} color="#fff" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 m-0">Personal Information</h2>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                            <div className="profile-input bg-gray-100 text-gray-500 cursor-not-allowed">{email}</div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="profile-input"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {nameMessage && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-4 ${
                                nameMessage.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {nameMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                {nameMessage.text}
                            </div>
                        )}

                        <button
                            onClick={handleSaveName}
                            disabled={nameLoading || nameUnchanged}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-[10px] border-none cursor-pointer text-sm font-semibold transition-all duration-200"
                            style={{
                                background: nameUnchanged ? '#E5E7EB' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                color: nameUnchanged ? '#9CA3AF' : '#fff',
                                opacity: nameLoading ? 0.7 : 1,
                            }}
                        >
                            <Save size={14} />
                            {nameLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Password Section */}
                    <div className="profile-card">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                                <Lock size={16} color="#fff" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 m-0">Change Password</h2>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="profile-input" placeholder="Enter current password" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="profile-input" placeholder="At least 8 characters" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="profile-input" placeholder="Repeat new password" />
                        </div>

                        {passwordMessage && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-4 ${
                                passwordMessage.type === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {passwordMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                {passwordMessage.text}
                            </div>
                        )}

                        <button
                            onClick={handleChangePassword}
                            disabled={passwordLoading || passwordIncomplete}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-[10px] border-none cursor-pointer text-sm font-semibold transition-all duration-200"
                            style={{
                                background: passwordIncomplete ? '#E5E7EB' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                color: passwordIncomplete ? '#9CA3AF' : '#fff',
                                opacity: passwordLoading ? 0.7 : 1,
                            }}
                        >
                            <Lock size={14} />
                        </button>
                    </div>

                </div> {/* End Left Column */}

                {/* Right Column */}
                <div className="flex-[1_1_300px] max-w-[400px]">

                    {/* G2 Review Section */}
                    <div className="profile-card">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                <span className="text-sm">⭐</span>
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 m-0">Love using Superkabe?</h2>
                        </div>

                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                            Your feedback helps us grow. Share your experience on G2 and help other outbound teams discover how to protect their infrastructure.
                        </p>

                        <a
                            href="https://www.g2.com/contributor/superkabe-reviews-e69828c5-b59e-4f0e-9e18-244e0697eafe"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-hover-lift-g2 inline-flex items-center gap-2 px-5 py-2 rounded-[10px] no-underline text-sm font-semibold text-white"
                            style={{
                                background: '#FF492C',
                                boxShadow: '0 4px 6px -1px rgba(255, 73, 44, 0.2)'
                            }}
                        >
                            Leave a Review on G2
                        </a>
                    </div>
                </div> {/* End Right Column */}
            </div> {/* End Flex Container */}
        </div>
    );
}
