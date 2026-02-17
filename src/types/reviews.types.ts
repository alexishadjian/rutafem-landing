import { Timestamp } from 'firebase/firestore';

export type ReviewDoc = {
    comment: string;
    rating: number;
    reviewed_id: string;
    reviewer_id: string;
    trip_id: string;
    created_at: Timestamp | Date;
    updated_at?: Timestamp | Date;
};

export type ReviewerSummary = {
    firstName: string;
    verifiedDate: Date;
};

export type Review = {
    id: string;
    comment: string;
    rating: number;
    reviewer: ReviewerSummary;
    createdAt: Date;
};
