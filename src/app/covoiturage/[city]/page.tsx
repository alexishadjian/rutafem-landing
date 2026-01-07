import Icon from '@/app/_components/ui/icon';
import { villes } from '@/datas/villes';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
    return villes.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slugCity = (await params).city;
    const city = villes.find((v) => v.slug === slugCity);
    if (!city) return { title: 'Page non trouvée' };

    return {
        title: `Covoiturage féminin à ${city.name} - Voyage sécurisé entre femmes | RutaFem`,
        description: `Covoiturage 100% féminin à ${city.name}. Voyagez entre femmes en toute sécurité avec RutaFem : transport écologique, économique et convivial partout en France.`,
        keywords: [
            `covoiturage ${city.name}`,
            `covoiturage féminin ${city.name}`,
            'covoiturage entre femmes',
            'voyage entre femmes',
            'transport écologique',
            'voyage pas cher France',
            'covoiturage sécurisé',
            'voyage féminin sécurisé',
        ],
        openGraph: {
            title: `Covoiturage féminin à ${city.name} | RutaFem`,
            description: `Rejoins la communauté RutaFem à ${city.name} : covoiturage 100% féminin, sécurisé et économique.`,
            type: 'website',
        },
    };
}

const benefits = [
    {
        icon: (
            <Icon
                name="lock"
                strokeColor="non"
                strokeWidth={0.5}
                fillColor="var(--dark-green)"
                width={24}
                height={24}
            />
        ),
        title: 'Sécurité garantie',
        description: 'Profils vérifiés, trajets 100% féminins pour voyager sereinement.',
    },
    {
        icon: (
            <Icon
                name="euro"
                strokeColor="none"
                strokeWidth={0.5}
                fillColor="var(--dark-green)"
                width={20}
                height={20}
            />
        ),
        title: 'Économies assurées',
        description: 'Partagez les frais et voyagez moins cher partout en France.',
    },
    {
        icon: (
            <Icon
                name="tree"
                strokeColor="none"
                strokeWidth={0.5}
                fillColor="var(--dark-green)"
                width={20}
                height={20}
            />
        ),
        title: 'Transport écologique',
        description: 'Réduisez votre empreinte carbone grâce au covoiturage solidaire.',
    },
    {
        icon: (
            <Icon
                name="message"
                strokeColor="none"
                strokeWidth={0.5}
                fillColor="var(--dark-green)"
                width={20}
                height={20}
            />
        ),
        title: 'Convivialité',
        description: 'Voyagez entre femmes et créez des liens sur la route.',
    },
];

export default async function CovoiturageVillePage({ params }: Props) {
    const slugCity = (await params).city;
    const city = villes.find((v) => v.slug === slugCity);
    if (!city) notFound();

    const relatedCities = villes.filter((v) => v.slug !== city.slug).slice(0, 24);

    return (
        <main className="flex-1 flex flex-col py-8 md:py-12 bg-[var(--dark-green)]">
            <article className="md:wrapper wrapper bg-[var(--white)] rounded-xl flex-1">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100">
                    <Link
                        href="/join-trip"
                        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-[var(--pink)] transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Voir tous les trajets
                    </Link>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--dark-green)] font-staatliches leading-tight">
                        Covoiturage féminin à {city.name}
                    </h1>
                    <p className="mt-4 text-lg text-gray-700">
                        Rejoins la communauté <strong>RutaFem</strong> et découvre le{' '}
                        <strong>covoiturage 100% féminin</strong> à {city.name}. Voyage en toute{' '}
                        <strong>sécurité</strong>, entre femmes, pour des trajets{' '}
                        <strong>économiques</strong> et <strong>écologiques</strong>.
                    </p>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
                    {/* Left column - SEO content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Benefits section */}
                        <section>
                            <h2 className="text-2xl font-bold text-[var(--dark-green)] font-staatliches mb-6">
                                Pourquoi choisir le covoiturage entre femmes à {city.name} ?
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {benefits.map((benefit) => (
                                    <div
                                        key={benefit.title}
                                        className="p-4 bg-gray-50 rounded-2xl hover:bg-[var(--pink)]/10 transition-colors"
                                    >
                                        <span className="text-2xl mb-2 block">{benefit.icon}</span>
                                        <h3 className="font-semibold text-[var(--dark-green)]">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {benefit.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quartiers section */}
                        <section>
                            <h2 className="text-2xl font-bold text-[var(--dark-green)] font-staatliches mb-4">
                                Trajets sécurisés depuis {city.name}
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Que tu partes de <strong>{city.quartiers[0]}</strong>,{' '}
                                <strong>{city.quartiers[1]}</strong> ou{' '}
                                <strong>{city.quartiers[2]}</strong>, trouve un{' '}
                                <strong>covoiturage féminin</strong> adapté à tes besoins. RutaFem
                                connecte les femmes de {city.name} pour des{' '}
                                <strong>voyages pas cher</strong> partout en France.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {city.quartiers.map((quartier) => (
                                    <span
                                        key={quartier}
                                        className="px-3 py-1 bg-[var(--yellow)]/20 text-[var(--dark-green)] rounded-full text-sm font-medium"
                                    >
                                        {quartier}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* SEO text section */}
                        <section className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-[var(--dark-green)] font-staatliches mb-4">
                                Transport écologique et économique à {city.name}
                            </h2>
                            <p className="text-gray-700">
                                Le <strong>covoiturage entre femmes</strong> est la solution idéale
                                pour voyager <strong>moins cher</strong> tout en réduisant ton
                                impact environnemental. Avec RutaFem, chaque trajet depuis{' '}
                                {city.name} devient une opportunité de rencontrer d&apos;autres
                                femmes et de partager un <strong>voyage sécurisé</strong>.
                            </p>
                            <p className="text-gray-700">
                                Notre plateforme de <strong>covoiturage féminin</strong> garantit
                                que tous les profils sont vérifiés. Fini le stress des trajets en
                                solo : rejoins une communauté solidaire et bienveillante pour tes
                                déplacements en France.
                            </p>
                        </section>
                    </div>

                    {/* Right column - CTA */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* CTA Card */}
                            <div className="bg-[var(--dark-green)] text-[var(--white)] p-6 rounded-2xl">
                                <h3 className="text-xl font-bold font-staatliches mb-3">
                                    Prête à voyager depuis {city.name} ?
                                </h3>
                                <p className="text-sm opacity-90 mb-6">
                                    Rejoins RutaFem et trouve ton prochain covoiturage 100% féminin.
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        href="/join-trip"
                                        className="block w-full text-center bg-[var(--pink)] text-white py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Trouver un trajet
                                    </Link>
                                    <Link
                                        href="/create-trip"
                                        className="block w-full text-center bg-[var(--yellow)] text-[var(--dark-green)] py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Proposer un trajet
                                    </Link>
                                </div>
                            </div>

                            {/* Stats card */}
                            <div className="bg-[var(--orange)]/10 p-6 rounded-2xl">
                                <h4 className="font-semibold text-[var(--dark-green)] mb-4">
                                    Covoiturage féminin en chiffres
                                </h4>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-center gap-2">
                                        <span className="w-8 h-8 bg-[var(--pink)] rounded-full flex items-center justify-center text-white text-xs">
                                            ✓
                                        </span>
                                        100% des profils vérifiés
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-8 h-8 bg-[var(--blue)] rounded-full flex items-center justify-center text-white text-xs">
                                            ✓
                                        </span>
                                        Trajets partout en France
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-8 h-8 bg-[var(--orange)] rounded-full flex items-center justify-center text-white text-xs">
                                            ✓
                                        </span>
                                        Économies jusqu&apos;à 70%
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related cities */}
                <section className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-[var(--dark-green)] font-staatliches mb-6">
                        Covoiturage féminin dans d&apos;autres villes
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {relatedCities.map((v) => (
                            <Link
                                key={v.slug}
                                href={`/covoiturage/${v.slug}`}
                                className="block p-4 bg-white rounded-xl hover:shadow-md hover:border-[var(--pink)] border border-transparent transition-all text-center"
                            >
                                <span className="font-medium text-[var(--dark-green)]">
                                    {v.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <Link
                            href="/join-trip"
                            className="inline-flex items-center gap-2 text-[var(--pink)] font-medium hover:underline"
                        >
                            Voir tous les trajets disponibles
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>
                </section>
            </article>
        </main>
    );
}
