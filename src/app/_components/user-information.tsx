import Image from 'next/image';

import { formatDate } from '@/utils/date';
import Icon from './ui/icon';

type UserInformationProps = {
    firstName: string;
    rating?: number;
    verifiedDate?: Date | string;
    subtitle?: string;
    avatarUrl?: string;
    useProfilePicture?: boolean;
    avatarColor?: string;
};

const formatVerifiedDate = (value: Date | string) =>
    formatDate(value, { month: 'long', year: 'numeric' });

export default function UserInformation({
    firstName,
    rating,
    verifiedDate,
    subtitle,
    avatarUrl,
    useProfilePicture = false,
    avatarColor = '#FBD5E1',
}: UserInformationProps) {
    const initials = firstName.slice(0, 1).toUpperCase();

    const resolvedSubtitle =
        subtitle ??
        (verifiedDate
            ? `Conductrice vérifiée depuis ${formatVerifiedDate(verifiedDate)}`
            : undefined);

    return (
        <div className="flex items-center gap-3">
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--black)] font-semibold relative overflow-hidden"
                style={{ backgroundColor: avatarColor }}
            >
                {useProfilePicture && avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={firstName}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    initials
                )}
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-[var(--black)]">{firstName}</p>
                    {typeof rating === 'number' && (
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => {
                                const isActive = index < rating;
                                return (
                                    <Icon
                                        key={index}
                                        name="star"
                                        width={18}
                                        height={20}
                                        strokeColor={isActive ? '#F97316' : '#D4D4D8'}
                                        fillColor={isActive ? '#F97316' : '#D4D4D8'}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
                {resolvedSubtitle && (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Icon
                            name="starCheck"
                            width={16}
                            height={16}
                            strokeColor="var(--dark-green)"
                            fillColor="var(--yellow)"
                        />
                        Conductrice vérifiée
                    </p>
                )}
            </div>
        </div>
    );
}
