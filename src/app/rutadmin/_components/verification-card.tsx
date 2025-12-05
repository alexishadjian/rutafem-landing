import { PendingVerification } from '@/types/admin.types';
import { formatDate } from '@/utils/date';

type VerificationCardProps = {
    user: PendingVerification;
    onClick: () => void;
};

export const VerificationCard = ({ user, onClick }: VerificationCardProps) => {
    const hasIdentity = user.verificationStatus === 'Pending';
    const hasDriver = user.driverLicenseVerificationStatus === 'Pending';

    return (
        <div
            onClick={onClick}
            className="bg-[var(--white)] rounded-xl p-4 cursor-pointer hover:bg-[var(--white)]/80 transition-colors"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[var(--dark-green)] font-medium">
                        {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[var(--dark-green)] text-sm">{user.email}</p>
                </div>
                <p className="text-[var(--dark-green)] text-xs">{formatDate(user.createdAt)}</p>
            </div>
            <div className="flex gap-2">
                {hasIdentity && (
                    <span className="bg-[var(--yellow)]/20 text-[var(--yellow)] px-2 py-1 rounded text-xs">
                        Identité
                    </span>
                )}
                {hasDriver && (
                    <span className="bg-[var(--blue)]/20 text-[var(--blue)] px-2 py-1 rounded text-xs">
                        Permis
                    </span>
                )}
            </div>
        </div>
    );
};
