import Icon from '@/app/_components/ui/icon';
import { UserProfile } from '@/types/users.types';

type UserContactProps = {
    userProfile: UserProfile;
    onEdit?: () => void;
};

export const UserContact = ({ userProfile, onEdit }: UserContactProps) => {
    return (
        <div className="bg-[var(--blue)] rounded-3xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4">Informations de contact</h3>
            <div className="space-y-3 mb-auto">
                <div className="flex items-center gap-2 text-white">
                    <Icon
                        name="email"
                        width={24}
                        height={24}
                        fillColor="none"
                        strokeColor="var(--white)"
                    />
                    <span>{userProfile.email}</span>
                </div>
                {userProfile.phoneNumber && (
                    <div className="flex items-center gap-2 text-white">
                        <Icon
                            name="phone"
                            width={24}
                            height={24}
                            fillColor="var(--white)"
                            strokeColor="none"
                        />
                        <span>{userProfile.phoneNumber}</span>
                    </div>
                )}
            </div>
            <button
                onClick={onEdit}
                className="w-full bg-[var(--pink)] text-[var(--black)] rounded-lg py-3 px-4 font-medium hover:opacity-90 transition-opacity mt-6"
            >
                Modifier mes informations
            </button>
        </div>
    );
};
