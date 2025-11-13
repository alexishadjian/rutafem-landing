'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CancelContent() {
    const searchParams = useSearchParams();
    const tripId = searchParams.get('tripId');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
                <p className="text-gray-600 mb-6">Aucun montant n'a été débité. Vous pouvez réessayer.</p>
                {tripId ? (
                    <Link href={`/trip/${tripId}`} className="btn">
                        Retour au trajet
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

export default function JoinTripCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <CancelContent />
        </Suspense>
    );
}