'use client';

import { cancelTripByAdmin, deleteTripByAdmin, updateTripByAdmin } from '@/lib/firebase/admin';
import { getTripById } from '@/lib/firebase/trips';
import { TripWithDriver } from '@/types/trips.types';
import { formatDate } from '@/utils/date';
import { logFirebaseError } from '@/utils/errors';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminGuard } from '../../_components/admin-guard';

export default function TripDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        departureCity: '',
        arrivalCity: '',
        departureDate: '',
        departureTime: '',
        pricePerSeat: 0,
        totalSeats: 0,
    });

    useEffect(() => {
        const loadTrip = async () => {
            try {
                const data = await getTripById(id);
                setTrip(data);
                if (data) {
                    setForm({
                        departureCity: data.departureCity,
                        arrivalCity: data.arrivalCity,
                        departureDate: data.departureDate,
                        departureTime: data.departureTime,
                        pricePerSeat: data.pricePerSeat,
                        totalSeats: data.totalSeats,
                    });
                }
            } catch (error) {
                logFirebaseError('TripDetailPage.loadTrip', error);
            } finally {
                setLoading(false);
            }
        };
        loadTrip();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTripByAdmin(id, form);
            const updated = await getTripById(id);
            setTrip(updated);
            setEditMode(false);
        } catch (error) {
            logFirebaseError('TripDetailPage.handleSave', error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Annuler ce trajet ?')) return;
        setSaving(true);
        try {
            await cancelTripByAdmin(id);
            const updated = await getTripById(id);
            setTrip(updated);
        } catch (error) {
            logFirebaseError('TripDetailPage.handleCancel', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Supprimer définitivement ce trajet ?')) return;
        setSaving(true);
        try {
            await deleteTripByAdmin(id);
            router.push('/rutadmin/trips');
        } catch (error) {
            logFirebaseError('TripDetailPage.handleDelete', error);
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

    if (!trip) {
        return (
            <AdminGuard>
                <main className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="wrapper text-center py-20">
                        <p className="text-[var(--white)] text-lg">Trajet non trouvé</p>
                        <Link
                            href="/rutadmin/trips"
                            className="text-[var(--pink)] mt-4 inline-block"
                        >
                            ← Retour aux trajets
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
                            href="/rutadmin/trips"
                            className="text-[var(--white)] hover:text-[var(--pink)] transition-colors"
                        >
                            ← Retour
                        </Link>
                        <h1 className="text-[var(--white)] text-2xl font-bold">
                            Détails du trajet
                        </h1>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                        <span
                            className={`px-3 py-1 rounded-full text-sm ${
                                trip.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                            }`}
                        >
                            {trip.isActive ? 'Actif' : 'Annulé'}
                        </span>
                    </div>

                    {/* Trip Info Card */}
                    <div className="bg-[var(--white)] rounded-xl p-6 mb-6">
                        {editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Ville de départ"
                                    value={form.departureCity}
                                    onChange={(v) => setForm({ ...form, departureCity: v })}
                                />
                                <InputField
                                    label="Ville d'arrivée"
                                    value={form.arrivalCity}
                                    onChange={(v) => setForm({ ...form, arrivalCity: v })}
                                />
                                <InputField
                                    label="Date"
                                    type="date"
                                    value={form.departureDate}
                                    onChange={(v) => setForm({ ...form, departureDate: v })}
                                />
                                <InputField
                                    label="Heure"
                                    type="time"
                                    value={form.departureTime}
                                    onChange={(v) => setForm({ ...form, departureTime: v })}
                                />
                                <InputField
                                    label="Prix/place (€)"
                                    type="number"
                                    value={String(form.pricePerSeat)}
                                    onChange={(v) => setForm({ ...form, pricePerSeat: Number(v) })}
                                />
                                <InputField
                                    label="Places totales"
                                    type="number"
                                    value={String(form.totalSeats)}
                                    onChange={(v) => setForm({ ...form, totalSeats: Number(v) })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <InfoRow
                                    label="Trajet"
                                    value={`${trip.departureCity} → ${trip.arrivalCity}`}
                                />
                                <InfoRow
                                    label="Date"
                                    value={formatDate(new Date(trip.departureDate))}
                                />
                                <InfoRow label="Heure" value={trip.departureTime} />
                                <InfoRow label="Prix/place" value={`${trip.pricePerSeat}€`} />
                                <InfoRow
                                    label="Places"
                                    value={`${trip.availableSeats}/${trip.totalSeats} disponibles`}
                                />
                                <InfoRow
                                    label="Participants"
                                    value={`${trip.participants.length} inscrit(s)`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Driver Info */}
                    <div className="bg-[var(--white)] rounded-xl p-6 mb-6">
                        <h3 className="text-[var(--dark-green)] font-semibold mb-4">Conductrice</h3>
                        <div className="space-y-2">
                            <InfoRow
                                label="Nom"
                                value={`${trip.driver.firstName} ${trip.driver.lastName}`}
                            />
                            <InfoRow label="Email" value={trip.driver.email} />
                            <InfoRow label="Téléphone" value={trip.driver.phoneNumber} />
                        </div>
                    </div>

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
                            <>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="px-6 py-3 rounded-xl bg-[var(--blue)]/20 text-[var(--blue)] hover:bg-[var(--blue)]/30 transition-colors"
                                >
                                    Modifier
                                </button>
                                {trip.isActive && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-6 py-3 rounded-xl bg-[var(--orange)]/20 text-[var(--orange)] hover:bg-[var(--orange)]/30 transition-colors disabled:opacity-50"
                                    >
                                        Annuler le trajet
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                    Supprimer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </AdminGuard>
    );
}

// Helper components
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
        <label className="text-[var(--dark-green)] text-sm block mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[var(--white)] text-[var(--dark-green)] rounded-lg px-4 py-2 border border-[var(--dark-green)] focus:border-[var(--pink)] outline-none"
        />
    </div>
);
