import { Review } from '@/types/reviews.types';
import UserInformation from './user-information';

type ReviewCardProps = {
    review: Review;
    order?: number;
};

const accentGradients = [
    'from-[#FFE6D4] to-[#FFD3AE]',
    'from-[#E1EBFF] to-[#C5DAFF]',
    'from-[#FFE3F4] to-[#FFC6E7]',
];

const clampComment = (value: string, max = 520) =>
    value.length > max ? `${value.slice(0, max)}…` : value;

export const ReviewCard = ({ review, order = 0 }: ReviewCardProps) => {
    const gradient = accentGradients[order % accentGradients.length];
    const truncatedComment = clampComment(review.comment);

    return (
        <article
            className={`rounded-[32px] border border-black bg-gradient-to-br ${gradient} p-6 shadow-sm min-w-[260px] md:min-w-[420px] h-[220px] snap-start flex flex-col`}
        >
            <div className="flex items-start justify-between gap-4">
                <UserInformation
                    firstName={review.reviewer.firstName}
                    rating={review.rating}
                    verifiedDate={review.reviewer.verifiedDate}
                />
            </div>

            <p className="mt-5 text-base leading-relaxed text-gray-900 flex-1 overflow-hidden whitespace-pre-line">
                {truncatedComment}
            </p>
        </article>
    );
};
