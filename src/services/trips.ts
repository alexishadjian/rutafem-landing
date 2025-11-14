import { doc, getDoc } from 'firebase/firestore';

import { getParticipantsInfo } from '@/lib/firebase/trips';
import { db } from '@/lib/firebaseConfig';
import { TripWithDriver } from '@/types/trips.types';

import { getStripeStatus, initiateStripeCheckout } from './stripe';

type DriverDoc = {
    stripeAccountId?: string | null;
};

export const resolveDriverStripeAccount = async (trip: TripWithDriver): Promise<string | null> => {
    if (trip.driver?.stripeAccountId) {
        try {
            const status = await getStripeStatus(trip.driver.stripeAccountId);
            if (status.accountId) return status.accountId;
        } catch {
            // ignore, fallback to Firestore
        }
    }

    try {
        const snapshot = await getDoc(doc(db, 'users', trip.driverId));
        if (snapshot.exists()) {
            const data = snapshot.data() as DriverDoc | undefined;
            return data?.stripeAccountId ?? null;
        }
    } catch {
        // silent fallback
    }
    return null;
};

export const startTripCheckout = async (trip: TripWithDriver, buyerUid: string) => {
    const destinationAccount = await resolveDriverStripeAccount(trip);
    if (!destinationAccount) {
        throw new Error('La conductrice doit connecter son compte bancaire');
    }

    const amountCents = Math.round(Number(trip.pricePerSeat) * 100);
    const label = `Trajet ${trip.departureCity} → ${trip.arrivalCity}`;

    return initiateStripeCheckout({
        tripId: trip.id,
        buyerUid,
        amountCents,
        destinationAccount,
        tripLabel: label,
    });
};

export const fetchParticipantsDetails = async (trip: TripWithDriver) => {
    if (trip.participants.length === 0) {
        return [];
    }
    return getParticipantsInfo(trip.participants);
};
