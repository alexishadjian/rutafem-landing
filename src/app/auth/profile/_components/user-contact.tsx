import Icon from '@/app/_components/ui/icon';
import { UserProfile } from '@/types/users.types';
import Link from 'next/link';

type UserContactProps = {
    userProfile: UserProfile;
};

export const UserContact = ({ userProfile }: UserContactProps) => {
    return (
        <div className="bg-[var(--blue)] rounded-2xl md:rounded-3xl p-3 md:p-6 h-full flex flex-col min-w-0">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">
                Informations de contact
            </h3>
            <div className="space-y-2 md:space-y-3 mb-auto min-w-0">
                <div className="flex items-center gap-2 text-white min-w-0">
                    <Icon
                        name="email"
                        width={20}
                        height={20}
                        fillColor="none"
                        strokeColor="var(--white)"
                    />
                    <span className="text-sm md:text-base truncate">{userProfile.email}</span>
                </div>
                {userProfile.phoneNumber && (
                    <div className="flex items-center gap-2 text-white min-w-0">
                        <Icon
                            name="phone"
                            width={20}
                            height={20}
                            fillColor="var(--white)"
                            strokeColor="none"
                        />
                        <span className="text-sm md:text-base truncate">
                            {userProfile.phoneNumber}
                        </span>
                    </div>
                )}
            </div>
            <Link
                href="/auth/profile/edit"
                className="w-full bg-[var(--pink)] text-[var(--black)] rounded-lg py-2 md:py-3 px-3 md:px-4 text-sm md:text-base font-medium hover:opacity-90 transition-opacity mt-4 md:mt-6 text-center"
            >
                Modifier mes informations
            </Link>
        </div>
    );
};
