type StatCardProps = {
    title: string;
    value: number;
    icon: string;
    color: 'pink' | 'yellow' | 'blue' | 'orange';
};

const colorMap = {
    pink: 'bg-[var(--pink)]',
    yellow: 'bg-[var(--yellow)]',
    blue: 'bg-[var(--blue)]',
    orange: 'bg-[var(--orange)]',
};

export const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <div className="bg-[var(--white)] rounded-xl p-6 flex items-center gap-4">
        <div className={`${colorMap[color]} p-4 rounded-xl text-2xl`}>{icon}</div>
        <div>
            <p className="text-[var(--dark-green)] opacity-70 text-sm">{title}</p>
            <p className="text-[var(--dark-green)] text-3xl font-bold">{value}</p>
        </div>
    </div>
);
