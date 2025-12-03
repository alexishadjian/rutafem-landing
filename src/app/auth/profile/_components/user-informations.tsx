import Icon from '@/app/_components/ui/icon';
import { UserProfile } from '@/types/users.types';
import Link from 'next/link';

type UserInformationsProps = {
    userProfile: UserProfile;
    iconFillColor?: string;
    iconStrokeColor?: string;
};

const getMonthsInCommunity = (createdAt: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths || 1;
};

export const UserInformations = ({
    userProfile,
    iconFillColor = 'var(--dark-green)',
    iconStrokeColor = 'none',
}: UserInformationsProps) => {
    const monthsInCommunity = getMonthsInCommunity(userProfile.createdAt);
    const roleLabel = userProfile.role === 'driver' ? 'Conductrice' : 'Voyageuse';
    const roleBgColor = userProfile.role === 'driver' ? 'bg-[var(--orange)]' : 'bg-[var(--yellow)]';

    return (
        <div className="bg-white rounded-3xl border border-[var(--dark-green)] p-6 h-full flex flex-col">
            <div className="flex items-start gap-3 mb-4">
                <div className="relative w-24 h-24 bg-[var(--pink)] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                        name="user"
                        width={48}
                        height={48}
                        fillColor={iconFillColor}
                        strokeColor={iconStrokeColor}
                    />
                    {userProfile.isUserVerified && (
                        <div className="absolute -top-1 right-1 rounded-full flex items-center justify-center">
                            <Icon
                                name="starCheck"
                                width={28}
                                height={28}
                                fillColor="var(--yellow)"
                                strokeColor="var(--dark-green)"
                            />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-1">
                    <div>
                        <h3 className="text-xl font-semibold text-[var(--black)]">
                            {userProfile.firstName}
                        </h3>
                        <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                    {typeof userProfile.averageRating === 'number' && (
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => {
                                const isActive = index < Math.round(userProfile.averageRating ?? 0);
                                return (
                                    <Icon
                                        key={index}
                                        name="star"
                                        width={18}
                                        height={18}
                                        strokeColor={isActive ? '#F97316' : '#D4D4D8'}
                                        fillColor={isActive ? '#F97316' : 'none'}
                                    />
                                );
                            })}
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-block py-2 px-3 rounded-full text-sm border border-[var(--black)] font-medium text-[var(--black)] ${roleBgColor}`}
                        >
                            {roleLabel}
                        </span>
                        {userProfile.role === 'passenger' && (
                            <Link
                                href="/auth/profile/driver-license"
                                className="inline-flex items-center gap-1 py-2 px-3 rounded-full text-xs md:text-sm border border-[var(--dark-green)] font-medium text-white bg-[var(--dark-green)] hover:opacity-90 transition-opacity"
                            >
                                <Icon
                                    name="plus"
                                    width={16}
                                    height={16}
                                    strokeColor="white"
                                    fillColor="none"
                                />
                                Devenir conductrice
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <div className="space-y-1 mt-auto">
                <p className="text-sm text-[var(--black)]">Dans notre communauté depuis</p>
                <p className="text-2xl font-bold text-[var(--black)]">{monthsInCommunity} mois</p>
                <p className="text-sm text-gray-600">0 trajets effectués</p>
            </div>
        </div>
    );
};
