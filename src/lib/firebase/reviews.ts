import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    where,
} from 'firebase/firestore';

import { Review, ReviewDoc } from '@/types/reviews.types';
import { timestampToDate } from '@/utils/date';
import { logFirebaseError } from '@/utils/errors';

import { db } from '../firebaseConfig';

const reviewsCollection = collection(db, 'reviews');
const usersCollection = collection(db, 'users');

const updateUserAverageRating = async (userId: string, ratingChange: number, isAdding: boolean) => {
    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(usersCollection, userId);
            const userSnap = await transaction.get(userRef);

            if (!userSnap.exists()) {
                throw new Error('Utilisateur introuvable');
            }

            const userData = userSnap.data();
            const currentTotalReviews = (userData.totalReviews as number) ?? 0;
            const currentAverageRating = (userData.averageRating as number) ?? 0;

            let newTotalReviews: number;
            let newAverageRating: number;

            if (isAdding) {
                newTotalReviews = currentTotalReviews + 1;
                const currentTotalRating = currentAverageRating * currentTotalReviews;
                newAverageRating = (currentTotalRating + ratingChange) / newTotalReviews;
            } else {
                newTotalReviews = Math.max(0, currentTotalReviews - 1);
                if (newTotalReviews === 0) {
                    newAverageRating = 0;
                } else {
                    const currentTotalRating = currentAverageRating * currentTotalReviews;
                    newAverageRating = (currentTotalRating - ratingChange) / newTotalReviews;
                }
            }

            transaction.update(userRef, {
                averageRating: Math.round(newAverageRating * 10) / 10,
                totalReviews: newTotalReviews,
                updatedAt: new Date(),
            });
        });
    } catch (error) {
        logFirebaseError('updateUserAverageRating', error);
        throw error instanceof Error
            ? error
            : new Error('Erreur lors de la mise à jour de la moyenne');
    }
};

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

export const getReviewsLeftByUserId = async (userId: string): Promise<Review[]> => {
    try {
        const reviewsQuery = query(
            reviewsCollection,
            where('reviewer_id', '==', userId),
            orderBy('created_at', 'desc'),
        );
        const snapshot = await getDocs(reviewsQuery);

        const reviews = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data() as ReviewDoc;
                const reviewed = await buildReviewerSummary(data.reviewed_id);

                return {
                    id: docSnapshot.id,
                    comment: data.comment,
                    rating: data.rating,
                    reviewer: reviewed,
                    createdAt: timestampToDate(data.created_at),
                } satisfies Review;
            }),
        );

        return reviews;
    } catch (error) {
        logFirebaseError('getReviewsLeftByUserId', error);
        return [];
    }
};

type CreateReviewParams = {
    comment: string;
    rating: number;
    reviewedId: string;
    reviewerId: string;
    tripId: string;
};

export const getReviewedIdsForTripByUser = async (
    reviewerId: string,
    tripId: string,
): Promise<string[]> => {
    try {
        const q = query(
            reviewsCollection,
            where('reviewer_id', '==', reviewerId),
            where('trip_id', '==', tripId),
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => (d.data() as ReviewDoc).reviewed_id);
    } catch {
        return [];
    }
};

export const createReview = async ({
    comment,
    rating,
    reviewedId,
    reviewerId,
    tripId,
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
            trip_id: tripId,
            created_at: new Date(),
            updated_at: new Date(),
        });

        await updateUserAverageRating(reviewedId, rating, true);
    } catch (error) {
        logFirebaseError('createReview', error);
        throw error instanceof Error ? error : new Error("Erreur lors de la création de l'avis.");
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

        const reviewedId = data.reviewed_id;
        const rating = data.rating;

        await deleteDoc(reviewRef);
        await updateUserAverageRating(reviewedId, rating, false);
    } catch (error) {
        logFirebaseError('deleteReview', error);
        throw error instanceof Error
            ? error
            : new Error("Erreur lors de la suppression de l'avis.");
    }
};
