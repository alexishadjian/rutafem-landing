import Link from 'next/link';

type TripAlertProps = {
    tripId: string;
};

export const TripAlert = ({ tripId }: TripAlertProps) => (
    <div className="bg-[var(--dark-green)] text-[var(--white)] p-6 rounded-2xl">
        <h4 className="text-xl font-bold mb-3">Un problème sur ton trajet ?</h4>
        <p className="text-sm opacity-90 mb-6">
            Si durant ton trajet quelque chose t&apos;a mise mal à l&apos;aise — non-respect des
            Conditions d&apos;utilisation, non-respect du Code de conduite, propos ou attitudes
            inappropriés — tu peux nous le signaler ici.
        </p>
        <div className="flex justify-center">
            <Link
                href={`/trip/${tripId}/report`}
                className="bg-[var(--pink)] text-[var(--black)] py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
                Signaler un problème
            </Link>
        </div>
    </div>
);
