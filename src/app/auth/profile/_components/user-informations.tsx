'use client';

import Icon from '@/app/_components/ui/icon';
import { uploadProfilePhoto } from '@/lib/firebase/users';
import { UserProfile } from '@/types/users.types';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

type UserInformationsProps = {
    userProfile: UserProfile;
    completedTripsCount?: number;
    onPhotoUpdated?: () => void;
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
    completedTripsCount = 0,
    onPhotoUpdated,
    iconFillColor = 'var(--dark-green)',
    iconStrokeColor = 'none',
}: UserInformationsProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const monthsInCommunity = getMonthsInCommunity(userProfile.createdAt);
    const roleLabel = userProfile.role === 'driver' ? 'Conductrice' : 'Voyageuse';
    const roleBgColor = userProfile.role === 'driver' ? 'bg-[var(--orange)]' : 'bg-[var(--yellow)]';

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userProfile.uid) return;
        setUploadError('');
        setUploading(true);
        try {
            await uploadProfilePhoto(userProfile.uid, file);
            onPhotoUpdated?.();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white rounded-2xl md:rounded-3xl border border-[var(--dark-green)] p-3 md:p-6 h-full flex flex-col min-w-0">
            <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4 min-w-0">
                <div className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[var(--pink)] rounded-full flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity disabled:opacity-70"
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                        {userProfile.avatarUrl ? (
                            <Image
                                src={userProfile.avatarUrl}
                                alt={userProfile.firstName}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        ) : (
                            <Icon
                                name="user"
                                width={32}
                                height={32}
                                fillColor={iconFillColor}
                                strokeColor={iconStrokeColor}
                            />
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            </div>
                        )}
                    </button>
                    {userProfile.isUserVerified && (
                        <div className="absolute -top-0.5 right-0 md:-top-1 md:right-1 z-20 rounded-full flex items-center justify-center">
                            <Icon
                                name="starCheck"
                                width={20}
                                height={20}
                                fillColor="var(--yellow)"
                                strokeColor="var(--dark-green)"
                            />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="min-w-0">
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--black)] truncate">
                            {userProfile.firstName}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                            {userProfile.email}
                        </p>
                    </div>
                    {typeof userProfile.averageRating === 'number' && (
                        <div className="flex items-center gap-0.5 md:gap-1">
                            {Array.from({ length: 5 }).map((_, index) => {
                                const isActive = index < Math.round(userProfile.averageRating ?? 0);
                                return (
                                    <Icon
                                        key={index}
                                        name="star"
                                        width={14}
                                        height={14}
                                        strokeColor={isActive ? '#F97316' : '#D4D4D8'}
                                        fillColor={isActive ? '#F97316' : 'none'}
                                    />
                                );
                            })}
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <span
                            className={`inline-block py-1.5 md:py-2 px-2 md:px-3 rounded-full text-xs md:text-sm border border-[var(--black)] font-medium text-[var(--black)] ${roleBgColor} whitespace-nowrap`}
                        >
                            {roleLabel}
                        </span>
                        {userProfile.role === 'passenger' && (
                            <Link
                                href="/auth/profile/driver-license"
                                className="inline-flex items-center gap-1 py-1.5 md:py-2 px-2 md:px-3 rounded-full text-xs border border-[var(--dark-green)] font-medium text-white bg-[var(--dark-green)] hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                <Icon
                                    name="plus"
                                    width={12}
                                    height={12}
                                    strokeColor="white"
                                    fillColor="none"
                                />
                                <span className="hidden sm:inline">Devenir conductrice</span>
                                <span className="sm:hidden">Conductrice</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <div className="space-y-0.5 md:space-y-1 mt-auto">
                <p className="text-xs md:text-sm text-[var(--black)]">
                    Dans notre communauté depuis
                </p>
                <p className="text-xl md:text-2xl font-bold text-[var(--black)]">
                    {monthsInCommunity} mois
                </p>
                <p className="text-xs md:text-sm text-gray-600">
                    {completedTripsCount} trajet{completedTripsCount !== 1 ? 's' : ''} effectué
                    {completedTripsCount !== 1 ? 's' : ''}
                </p>
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            </div>
        </div>
    );
};
