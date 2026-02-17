'use client';

import { approveVerification, rejectVerification } from '@/lib/firebase/admin';
import { PendingVerification, VerificationType } from '@/types/admin.types';
import { useState } from 'react';

type VerificationModalProps = {
    user: PendingVerification;
    onClose: () => void;
    onAction: () => void;
};

export const VerificationModal = ({ user, onClose, onAction }: VerificationModalProps) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<VerificationType>(
        user.verificationStatus === 'Pending' ? 'identity' : 'driver',
    );

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            if (action === 'approve') {
                await approveVerification(user.uid, activeTab);
                // Notify user by email that their verification was approved
                fetch('/api/email/verification-approved', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, firstName: user.firstName, type: activeTab }),
                }).catch((err) => console.error('Failed to send verification email:', err));
            } else {
                await rejectVerification(user.uid, activeTab);
            }
            onAction();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const hasIdentityPending = user.verificationStatus === 'Pending';
    const hasDriverPending = user.driverLicenseVerificationStatus === 'Pending';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--dark-green)] border-2 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-[var(--white)]/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-[var(--white)] text-xl font-semibold">
                            {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-[var(--white)] text-sm">{user.email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--white)] hover:text-[var(--white)] text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--white)]/10">
                    {hasIdentityPending && (
                        <button
                            onClick={() => setActiveTab('identity')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'identity'
                                    ? 'text-[var(--pink)] border-b-2 border-[var(--pink)]'
                                    : 'text-[var(--white)] hover:text-[var(--pink)]'
                            }`}
                        >
                            Pièce d&apos;identité
                        </button>
                    )}
                    {hasDriverPending && (
                        <button
                            onClick={() => setActiveTab('driver')}
                            className={`px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'driver'
                                    ? 'text-[var(--pink)] border-b-2 border-[var(--pink)]'
                                    : 'text-[var(--white)] hover:text-[var(--pink)]'
                            }`}
                        >
                            Permis de conduire
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeTab === 'identity' ? (
                            <>
                                <DocumentImage label="Recto" url={user.idCardFront} />
                                <DocumentImage label="Verso" url={user.idCardBack} />
                            </>
                        ) : (
                            <>
                                <DocumentImage label="Recto" url={user.driverLicenseFront} />
                                <DocumentImage label="Verso" url={user.driverLicenseBack} />
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-[var(--white)]/10 flex gap-4 justify-end">
                    <button
                        onClick={() => handleAction('reject')}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                        {loading ? '...' : 'Rejeter'}
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                        {loading ? '...' : 'Approuver'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// check if file is a pdf based on url
const isPdfUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.pdf') || lowerUrl.includes('application%2fpdf');
};

// Use native img to avoid Next.js Image Optimizer (server can't auth with Firebase)
const DocumentImage = ({ label, url }: { label: string; url?: string }) => {
    const isPdf = url ? isPdfUrl(url) : false;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[var(--white)] text-sm">{label}</p>
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--pink)] text-xs hover:underline"
                    >
                        Ouvrir dans un nouvel onglet ↗
                    </a>
                )}
            </div>
            {url ? (
                isPdf ? (
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-[var(--black)]">
                        <iframe
                            src={url}
                            title={label}
                            className="w-full h-full"
                            style={{ minHeight: '400px' }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-xs text-center">📄 Document PDF</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-[var(--black)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={label} className="w-full h-full object-contain" />
                    </div>
                )
            ) : (
                <div className="aspect-[3/2] rounded-xl bg-[var(--black)] flex items-center justify-center">
                    <p className="text-[var(--white)]/40">Non fourni</p>
                </div>
            )}
        </div>
    );
};
