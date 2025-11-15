'use client';

import { useRef } from 'react';

import { Review } from '@/types/reviews.types';

import { ReviewCard } from './reviewCard';

type ReviewsSectionProps = {
    title: string;
    reviews: Review[];
    loading: boolean;
};

export const ReviewsSection = ({ title, reviews, loading }: ReviewsSectionProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'left' | 'right') => {
        const node = scrollRef.current;
        if (!node) return;
        const offset = direction === 'left' ? -400 : 400;
        node.scrollBy({ left: offset, behavior: 'smooth' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{reviews.length} avis</span>
                    {!loading && reviews.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Faire défiler vers la gauche"
                                onClick={() => handleScroll('left')}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <span className="sr-only">Précédent</span>
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                aria-label="Faire défiler vers la droite"
                                onClick={() => handleScroll('right')}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <span className="sr-only">Suivant</span>
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(2)].map((_, index) => (
                        <div
                            key={index}
                            className="h-[280px] min-w-[320px] md:min-w-[380px] rounded-[32px] bg-gray-100 animate-pulse snap-start"
                        />
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
                    role="list"
                    aria-label="Avis de la conductrice"
                >
                    {reviews.map((review, index) => (
                        <ReviewCard key={review.id} review={review} order={index} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    Pas encore d&rsquo;avis pour cette conductrice.
                </p>
            )}
        </div>
    );
};
