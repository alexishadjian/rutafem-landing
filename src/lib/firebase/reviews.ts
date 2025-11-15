import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
} from 'firebase/firestore';

import { Review, ReviewDoc } from '@/types/reviews.types';
import { timestampToDate } from '@/utils/date';
import { logFirebaseError } from '@/utils/errors';

import { db } from '../firebaseConfig';

const reviewsCollection = collection(db, 'reviews');

const buildReviewerSummary = async (reviewerId: string) => {
    try {
        const snapshot = await getDoc(doc(db, 'users', reviewerId));
        if (!snapshot.exists()) {
            return {
                firstName: 'Membre',
                verifiedDate: new Date(),
            };
        }
        const data = snapshot.data();
        const firstName = (data.firstName as string) ?? 'Super pilote';
        const verifiedDate =
            timestampToDate((data.verifiedAt as Date) ?? data.createdAt) ?? new Date();

        return {
            firstName,
            verifiedDate,
        };
    } catch (error) {
        logFirebaseError('buildReviewerSummary', error);
        return {
            firstName: 'Membre',
            verifiedDate: new Date(),
        };
    }
};

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
    try {
        const reviewsQuery = query(
            reviewsCollection,
            where('reviewed_id', '==', userId),
            orderBy('created_at', 'desc'),
        );
        const snapshot = await getDocs(reviewsQuery);

        const reviews = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data() as ReviewDoc;
                const reviewer = await buildReviewerSummary(data.reviewer_id);

                return {
                    id: docSnapshot.id,
                    comment: data.comment,
                    rating: data.rating,
                    reviewer,
                    createdAt: timestampToDate(data.created_at),
                } satisfies Review;
            }),
        );

        return reviews;
    } catch (error) {
        logFirebaseError('getReviewsByUserId', error);
        return [];
    }
};

type CreateReviewParams = {
    comment: string;
    rating: number;
    reviewedId: string;
    reviewerId: string;
};

export const createReview = async ({
    comment,
    rating,
    reviewedId,
    reviewerId,
}: CreateReviewParams) => {
    try {
        if (!comment.trim()) {
            throw new Error('Le commentaire est requis.');
        }
        if (rating < 1 || rating > 5) {
            throw new Error('La note doit être comprise entre 1 et 5.');
        }
        if (reviewedId === reviewerId) {
            throw new Error('Impossible de laisser un avis sur soi-même.');
        }

        await addDoc(reviewsCollection, {
            comment: comment.trim(),
            rating,
            reviewed_id: reviewedId,
            reviewer_id: reviewerId,
            created_at: new Date(),
            updated_at: new Date(),
        });
    } catch (error) {
        logFirebaseError('createReview', error);
        throw error instanceof Error ? error : new Error('Erreur lors de la création de l’avis.');
    }
};

export const deleteReview = async (reviewId: string, reviewerId: string) => {
    try {
        const reviewRef = doc(reviewsCollection, reviewId);
        const snapshot = await getDoc(reviewRef);
        if (!snapshot.exists()) {
            throw new Error('Avis introuvable.');
        }
        const data = snapshot.data() as ReviewDoc;
        if (data.reviewer_id !== reviewerId) {
            throw new Error('Tu ne peux supprimer que tes propres avis.');
        }
        await deleteDoc(reviewRef);
    } catch (error) {
        logFirebaseError('deleteReview', error);
        throw error instanceof Error
            ? error
            : new Error('Erreur lors de la suppression de l’avis.');
    }
};
