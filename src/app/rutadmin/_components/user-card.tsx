import { AdminUser } from '@/types/admin.types';
import Link from 'next/link';

type AdminUserCardProps = { user: AdminUser };

const StatusBadge = ({ verified, label }: { verified: boolean; label: string }) => (
    <span
        className={`px-2 py-1 rounded text-xs ${
            verified
                ? 'bg-green-500/20 text-green-400'
                : 'bg-[var(--white)]/10 text-[var(--white)]/40'
        }`}
    >
        {label}
    </span>
);

export const AdminUserCard = ({ user }: AdminUserCardProps) => (
    <Link
        href={`/rutadmin/users/${user.uid}`}
        className="bg-[var(--white)] rounded-xl p-4 block hover:bg-[var(--white)]/80 transition-colors"
    >
        <div className="flex items-center justify-between mb-2">
            <div>
                <p className="text-[var(--dark-green)] font-medium">
                    {user.firstName} {user.lastName}
                </p>
                <p className="text-[var(--dark-green)]/60 text-sm">{user.email}</p>
            </div>
            <span
                className={`px-2 py-1 rounded text-xs ${
                    user.role === 'driver'
                        ? 'bg-[var(--blue)]/20 text-[var(--blue)]'
                        : 'bg-[var(--pink)]/20 text-[var(--pink)]'
                }`}
            >
                {user.role === 'driver' ? 'Conductrice' : 'Passagère'}
            </span>
        </div>
        <div className="flex gap-2">
            <StatusBadge verified={user.isUserVerified} label="Identité" />
            {user.role === 'driver' && (
                <StatusBadge verified={user.isUserDriverVerified} label="Permis" />
            )}
        </div>
    </Link>
);
