import Link from 'next/link';

type SectionHeaderProps = {
    title: string;
    count: number;
    viewAllLink: string;
};

export const SectionHeader = ({ title, count, viewAllLink }: SectionHeaderProps) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <h2 className="text-[var(--white)] text-xl font-semibold">{title}</h2>
            <span className="bg-[var(--pink)] text-[var(--white)] px-2 py-1 rounded-full text-sm font-medium">
                {count}
            </span>
        </div>
        <Link
            href={viewAllLink}
            className="text-[var(--pink)] hover:text-[var(--yellow)] transition-colors text-sm"
        >
            Voir tout →
        </Link>
    </div>
);
