'use client';

import { RouteGuard } from '@/app/_components/route-guard';
import { useAuth } from '@/contexts/AuthContext';
import { getTripById } from '@/lib/firebase/trips';
import { TripWithDriver } from '@/types/trips.types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

const DEFAULT_PROBLEMS = [
    'Comportement inapproprié',
    "Non-respect des conditions d'utilisation",
    'Problème de ponctualité',
    'Problème de sécurité',
    'Non-respect du code de conduite',
] as const;

type PageProps = { params: Promise<{ id: string }> };

export default function TripReportPage({ params }: PageProps) {
    const { id } = use(params);
    const { user } = useAuth();
    const [trip, setTrip] = useState<TripWithDriver | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
    const [customText, setCustomText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await getTripById(id);
                setTrip(data ?? null);
            } catch {
                setTrip(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const toggleProblem = (problem: string) => {
        setSelectedProblems((prev) => {
            const next = new Set(prev);
            if (next.has(problem)) next.delete(problem);
            else next.add(problem);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (selectedProblems.size === 0 && !customText.trim()) return;
        setSubmitting(true);
        try {
            // TODO: Call n8n webhook to send report to teams when problem is reported
            setSubmitted(true);
        } catch {
            setSubmitting(false);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pink)]" />
                </div>
            </RouteGuard>
        );
    }

    if (!trip) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">Trajet non trouvé</p>
                        <Link
                            href="/join-trip"
                            className="text-[var(--black)] hover:text-[var(--pink)]"
                        >
                            Retour aux trajets
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    const isParticipant =
        user && (trip.driverId === user.uid || trip.participants.includes(user.uid));
    if (!isParticipant) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] flex items-center justify-center p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">
                            Vous ne pouvez signaler un problème que pour vos trajets.
                        </p>
                        <Link
                            href={`/trip/${id}`}
                            className="text-[var(--black)] hover:text-[var(--pink)]"
                        >
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    if (submitted) {
        return (
            <RouteGuard requireAuth requireVerified>
                <div className="min-h-screen bg-[var(--dark-green)] py-8">
                    <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--black)] mb-2">
                            Signalement envoyé
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Merci. Notre équipe va examiner votre signalement et vous contactera si
                            nécessaire.
                        </p>
                        <Link
                            href={`/trip/${id}`}
                            className="inline-block bg-[var(--dark-green)] text-white py-3 px-6 rounded-xl font-medium hover:opacity-90"
                        >
                            Retour au trajet
                        </Link>
                    </div>
                </div>
            </RouteGuard>
        );
    }

    return (
        <RouteGuard requireAuth requireVerified>
            <div className="min-h-screen bg-[var(--dark-green)] py-8">
                <div className="md:wrapper wrapper bg-[var(--white)] rounded-xl max-w-lg mx-auto p-6">
                    <Link
                        href={`/trip/${id}`}
                        className="flex items-center gap-2 mb-6 text-[var(--black)] hover:text-[var(--pink)]"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Retour au trajet
                    </Link>
                    <h1 className="text-2xl font-staatliches text-[var(--black)] mb-2">
                        Signaler un problème
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {trip.departureCity} → {trip.arrivalCity} ({trip.departureDate})
                    </p>

                    <p className="text-sm font-medium text-[var(--black)] mb-3">
                        Quel type de problème ?
                    </p>
                    <div className="space-y-2 mb-6">
                        {DEFAULT_PROBLEMS.map((problem) => (
                            <label
                                key={problem}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedProblems.has(problem)}
                                    onChange={() => toggleProblem(problem)}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-gray-800">{problem}</span>
                            </label>
                        ))}
                    </div>

                    <label className="block text-sm font-medium text-[var(--black)] mb-2">
                        Décrivez le problème (optionnel)
                    </label>
                    <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Ajoutez des détails..."
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-xl resize-none mb-6"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || (selectedProblems.size === 0 && !customText.trim())}
                        className="w-full bg-[var(--pink)] text-[var(--black)] py-3 px-6 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--black)] border-t-transparent" />
                                Envoi...
                            </span>
                        ) : (
                            'Envoyer le signalement'
                        )}
                    </button>
                </div>
            </div>
        </RouteGuard>
    );
}
