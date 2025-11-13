'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

function SuccessContent() {
    const params = useSearchParams();
    const tripId = params.get('tripId');
    const sessionId = params.get('session_id');
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const run = async () => {
            if (!tripId || !sessionId || done) return;
            try {
                const res = await fetch(`/api/stripe/session?id=${encodeURIComponent(sessionId)}`);
                const session = await res.json();
                if (!res.ok) throw new Error(session.error || 'Erreur session');
                if (session.payment_status !== 'paid') return;

                const tripRef = doc(db, 'trips', tripId);
                const tripSnap = await getDoc(tripRef);
                if (!tripSnap.exists()) return;
                const trip = tripSnap.data() as any;
                const buyerUid = session.metadata?.buyerUid as string | undefined;
                const quantity = Number(session.metadata?.quantity || '1');
                if (!buyerUid) return;
                if (!trip.isActive || trip.availableSeats < quantity) return;
                if (trip.participants?.includes(buyerUid)) {
                    setDone(true);
                    return;
                }
                await updateDoc(tripRef, {
                    participants: [...trip.participants, buyerUid],
                    availableSeats: trip.availableSeats - quantity,
                    updatedAt: new Date(),
                    lastCheckoutSessionId: sessionId,
                });
                setDone(true);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : 'Erreur');
            }
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId, sessionId, done]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement réussi</h1>
                <p className="text-gray-600 mb-6">Vous avez rejoint le trajet avec succès.</p>
                {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                {tripId ? (
                    <Link href={`/trip/${tripId}`} className="btn">
                        Voir le trajet
                    </Link>
                ) : (
                    <Link href="/join-trip" className="btn">
                        Retour aux trajets
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function JoinTripSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}