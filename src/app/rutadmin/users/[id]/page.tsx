'use client';

import { approveVerification, rejectVerification, updateUserByAdmin } from '@/lib/firebase/admin';
import { getUserProfile } from '@/lib/firebase/users';
import { VerificationType } from '@/types/admin.types';
import { UserProfile } from '@/types/users.types';
import { formatDate } from '@/utils/date';
import { logFirebaseError } from '@/utils/errors';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminGuard } from '../../_components/admin-guard';

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'passenger' as 'passenger' | 'driver',
    });

    const loadUser = async () => {
        try {
            const data = await getUserProfile(id);
            setUser(data);
            if (data) {
                setForm({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    role: data.role,
                });
            }
        } catch (error) {
            logFirebaseError('UserDetailPage.loadUser', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserByAdmin(id, form);
            await loadUser();
            setEditMode(false);
        } catch (error) {
            logFirebaseError('UserDetailPage.handleSave', error);
        } finally {
            setSaving(false);
        }
    };

    const handleVerification = async (type: VerificationType, action: 'approve' | 'reject') => {
        if (!confirm(`${action === 'approve' ? 'Approuver' : 'Rejeter'} cette vérification ?`))
            return;
        setSaving(true);
        try {
            if (action === 'approve') {
                await approveVerification(id, type);
            } else {
                await rejectVerification(id, type);
            }
            await loadUser();
        } catch (error) {
            logFirebaseError('UserDetailPage.handleVerification', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminGuard>
                <main className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                </main>
            </AdminGuard>
        );
    }

    if (!user) {
        return (
            <AdminGuard>
                <main className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="wrapper text-center py-20">
                        <p className="text-[var(--white)]/40 text-lg">Utilisatrice non trouvée</p>
                        <Link
                            href="/rutadmin/users"
                            className="text-[var(--pink)] mt-4 inline-block"
                        >
                            ← Retour aux utilisatrices
                        </Link>
                    </div>
                </main>
            </AdminGuard>
        );
    }

    return (
        <AdminGuard>
            <main className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="wrapper max-w-3xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link
                            href="/rutadmin/users"
                            className="text-[var(--white)] hover:text-[var(--pink)] transition-colors"
                        >
                            ← Retour
                        </Link>
                        <h1 className="text-[var(--white)] text-2xl font-bold">
                            {user.firstName} {user.lastName}
                        </h1>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <StatusBadge label={user.role === 'driver' ? 'Conductrice' : 'Passagère'} />
                        <StatusBadge label={`Identité: ${user.verificationStatus}`} />
                        {user.role === 'driver' && (
                            <StatusBadge
                                label={`Permis: ${user.driverLicenseVerificationStatus}`}
                            />
                        )}
                    </div>

                    {/* User Info Card */}
                    <div className="bg-[var(--white)] rounded-xl p-6 mb-6">
                        <h3 className="text-[var(--dark-green)] font-semibold mb-4">
                            Informations
                        </h3>
                        {editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Prénom"
                                    value={form.firstName}
                                    onChange={(v) => setForm({ ...form, firstName: v })}
                                />
                                <InputField
                                    label="Nom"
                                    value={form.lastName}
                                    onChange={(v) => setForm({ ...form, lastName: v })}
                                />
                                <InputField
                                    label="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(v) => setForm({ ...form, email: v })}
                                />
                                <InputField
                                    label="Téléphone"
                                    value={form.phoneNumber}
                                    onChange={(v) => setForm({ ...form, phoneNumber: v })}
                                />
                                <div>
                                    <label className="text-[var(--white)]/60 text-sm block mb-1">
                                        Rôle
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                role: e.target.value as 'passenger' | 'driver',
                                            })
                                        }
                                        className="w-full bg-[var(--dark-green)] text-[var(--white)] rounded-lg px-4 py-2 border border-[var(--white)]/10 focus:border-[var(--pink)] outline-none"
                                    >
                                        <option value="passenger">Passagère</option>
                                        <option value="driver">Conductrice</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <InfoRow label="Prénom" value={user.firstName} />
                                <InfoRow label="Nom" value={user.lastName} />
                                <InfoRow label="Email" value={user.email} />
                                <InfoRow label="Téléphone" value={user.phoneNumber} />
                                <InfoRow label="Inscrite le" value={formatDate(user.createdAt)} />
                            </div>
                        )}
                    </div>

                    {/* Documents Section */}
                    {(user.idCardFront || user.driverLicenseFront) && (
                        <div className="bg-[var(--dark-green)] rounded-xl p-6 mb-6">
                            <h3 className="text-[var(--white)] font-semibold mb-4">Documents</h3>

                            {/* Identity Documents */}
                            {(user.idCardFront || user.idCardBack) && (
                                <div className="mb-6">
                                    <p className="text-[var(--white)]/60 text-sm mb-3">
                                        Pièce d&apos;identité
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <DocumentImage url={user.idCardFront} label="Recto" />
                                        <DocumentImage url={user.idCardBack} label="Verso" />
                                    </div>
                                    {user.verificationStatus === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleVerification('identity', 'reject')
                                                }
                                                disabled={saving}
                                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                Rejeter
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleVerification('identity', 'approve')
                                                }
                                                disabled={saving}
                                                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                Approuver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Driver License */}
                            {(user.driverLicenseFront || user.driverLicenseBack) && (
                                <div>
                                    <p className="text-[var(--white)]/60 text-sm mb-3">
                                        Permis de conduire
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <DocumentImage
                                            url={user.driverLicenseFront}
                                            label="Recto"
                                        />
                                        <DocumentImage url={user.driverLicenseBack} label="Verso" />
                                    </div>
                                    {user.driverLicenseVerificationStatus === 'Pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleVerification('driver', 'reject')
                                                }
                                                disabled={saving}
                                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                Rejeter
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleVerification('driver', 'approve')
                                                }
                                                disabled={saving}
                                                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                Approuver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4">
                        {editMode ? (
                            <>
                                <button
                                    onClick={() => setEditMode(false)}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl bg-[var(--white)]/10 text-[var(--white)] hover:bg-[var(--white)]/20 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl bg-[var(--pink)] text-[var(--black)] hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-6 py-3 rounded-xl bg-[var(--yellow)] text-[var(--black)] transition-colors"
                            >
                                Modifier
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </AdminGuard>
    );
}

// Helper components
const StatusBadge = ({ label }: { label: string }) => {
    return <span className="px-3 py-1 rounded-full text-base text-[var(--white)]">{label}</span>;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between">
        <span className="text-[var(--dark-green)]">{label}</span>
        <span className="text-[var(--dark-green)]">{value}</span>
    </div>
);

const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) => (
    <div>
        <label className="text-[var(--white)]/60 text-sm block mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[var(--dark-green)] text-[var(--white)] rounded-lg px-4 py-2 border border-[var(--white)]/10 focus:border-[var(--pink)] outline-none"
        />
    </div>
);

// Use native img to avoid Next.js Image Optimizer (server can't auth with Firebase)
const DocumentImage = ({ url, label }: { url?: string; label: string }) => (
    <div className="space-y-1">
        <p className="text-[var(--white)]/40 text-xs">{label}</p>
        {url ? (
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-[var(--black)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={label} className="w-full h-full object-contain" />
            </div>
        ) : (
            <div className="aspect-[3/2] rounded-lg bg-[var(--black)] flex items-center justify-center">
                <p className="text-[var(--white)]/40 text-xs">Non fourni</p>
            </div>
        )}
    </div>
);
