'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Organization } from '@/types/api';
import { apiClient } from '@/lib/api';
import CopyButton from '@/components/CopyButton';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function OrganizationDetailsCard({ org }: { org: Organization | null }) {
    const [mailingAddress, setMailingAddress] = useState(org?.mailing_address || '');
    const [savingAddress, setSavingAddress] = useState(false);
    const [savedAddress, setSavedAddress] = useState(org?.mailing_address || '');

    useEffect(() => {
        if (org?.mailing_address !== undefined) {
            setMailingAddress(org.mailing_address || '');
            setSavedAddress(org.mailing_address || '');
        }
    }, [org?.mailing_address]);

    const dirty = mailingAddress.trim() !== savedAddress.trim();
    const missing = !savedAddress.trim();

    const handleSaveAddress = async () => {
        const trimmed = mailingAddress.trim();
        if (trimmed.length < 10) {
            toast.error('Postal address looks too short — include street, city, and country.');
            return;
        }
        if (!/,|\n/.test(trimmed)) {
            toast.error('Please separate street, city, and country with commas or line breaks.');
            return;
        }
        setSavingAddress(true);
        try {
            await apiClient('/api/organization', {
                method: 'PATCH',
                body: JSON.stringify({ mailing_address: trimmed }),
            });
            setSavedAddress(trimmed);
            toast.success('Mailing address saved');
        } catch (e: any) {
            toast.error(e?.message || 'Failed to save mailing address');
        } finally {
            setSavingAddress(false);
        }
    };

    return (
        <div className="premium-card mb-4">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Organization Details</h2>
            {org ? (
                <div>
                    <div className="px-6 py-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4 mb-6">
                        <span className="text-2xl">💡</span>
                        <div className="flex-1">
                            <p className="text-blue-800 text-[0.9rem] m-0">
                                <strong>Webhook Header Required:</strong> Include <code className="font-mono font-bold">x-organization-id</code> on any inbound webhook you wire to Superkabe (Clay, ESP-side senders, or any third-party tool posting to your endpoints).
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start flex-wrap mb-8">
                        <div className="w-[140px] shrink-0">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{org.name}</div>
                        </div>
                        <div className="w-[120px] shrink-0">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">{org.slug}</div>
                        </div>
                        <div className="flex-1 min-w-[260px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Organization ID
                                <span className="text-[0.65rem] font-medium text-slate-400 normal-case ml-2">(UUID format)</span>
                            </label>
                            <div className="flex gap-2">
                                <code className="flex-1 p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-sm">{org.id}</code>
                                <CopyButton text={org.id} label="Copy" />
                            </div>
                        </div>
                    </div>

                    {/* Mailing address — REQUIRED for sending. CAN-SPAM § 5(a)(5)
                        mandates a valid postal address in every commercial email,
                        and the dispatcher refuses to send any campaign whose org
                        hasn't configured one. */}
                    <div className={`p-5 rounded-xl border ${missing ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-start gap-3 mb-3">
                            <span className="text-xl">{missing ? '⚠️' : '📮'}</span>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    Sender postal address
                                    <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">Required</span>
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    CAN-SPAM § 5(a)(5) requires a valid postal address in every commercial email. We inject this into the unsubscribe footer of every send.
                                    {missing && <strong className="block mt-1 text-rose-700">Sending is blocked for all your campaigns until this is configured.</strong>}
                                </p>
                            </div>
                        </div>
                        <textarea
                            value={mailingAddress}
                            onChange={(e) => setMailingAddress(e.target.value)}
                            placeholder={'e.g.\n123 Market Street\nSuite 400\nSan Francisco, CA 94103\nUSA'}
                            rows={4}
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-mono focus:outline-none focus:border-slate-400"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-[10px] text-slate-400">
                                Include street, city, region, and country. We don&apos;t share or display this anywhere except the email footer.
                            </p>
                            <button
                                onClick={handleSaveAddress}
                                disabled={!dirty || savingAddress}
                                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingAddress ? 'Saving…' : 'Save address'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <LoadingSkeleton type="card" rows={2} />
            )}
        </div>
    );
}
