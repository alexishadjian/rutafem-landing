import { QuoteSection } from '@/components/quote-section';
import Button from '@/components/ui/button';
import { TeamMemberCard } from '@/components/ui/cards/team-member-card';
import Icon from '@/components/ui/icon';
import { ThreeWomanBack, WomanFacingMountain } from '@/images';
import Image from 'next/image';

const teamMembers = [
    {
        name: 'Melina Lázaro',
        role: 'Fondatrice / UX designer',
        linkedinUrl: 'https://www.linkedin.com/in/melina-celeste-lazaro-/',
    },
    {
        name: 'Mathis Laversin',
        role: 'Co-fondateur / Développeur',
        linkedinUrl: 'https://www.linkedin.com/in/mathis-laversin/',
    },
    {
        name: 'Alexis Hadjian',
        role: 'Co-fondateur / Développeur',
        linkedinUrl: 'https://www.linkedin.com/in/alexis-hadjian/',
    },
    {
        name: 'Margot Godard',
        role: 'Co-fondatrice / DA',
        linkedinUrl: 'https://www.linkedin.com/in/margot-godard-5794a9214/',
    },
    {
        name: 'Widad Majjad',
        role: 'Co-fondatrice / Marketing',
        linkedinUrl: 'https://www.linkedin.com/in/widad-majjad-160bb91aa/',
    },
    {
        name: 'Yasmine Achour',
        role: 'Co-fondatrice / Entreprenariat',
        linkedinUrl: 'https://www.linkedin.com/in/yasmine-achour-a4a342225/',
    },
    {
        name: 'Khaoula Chihab',
        role: 'Co-fondatrice / Big Data',
        linkedinUrl: 'https://www.linkedin.com/in/khaoula-chihab-b324a1210/',
    },
];

export default function NousConnaitrePage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="mt-20 mb-12 md:mt-24 md:mb-16">
                <div className="wrapper">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Image with overlay */}
                        <div className="relative lg:flex-1 lg:w-1/2 min-h-[400px] lg:min-h-[600px] border-[5px] border-b-0 lg:border-b-[5px] lg:border-r-0 border-[var(--black)] rounded-t-[32px] lg:rounded-l-[32px] lg:rounded-tr-none overflow-hidden">
                            <Image
                                src={WomanFacingMountain}
                                alt="Femme face aux montagnes"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue)] via-[var(--blue)] via-[20%] to-transparent" />
                            <div className="relative z-10 flex flex-col gap-6 p-8 lg:p-12 max-w-[500px]">
                                <span className="bg-[var(--pink)] px-5 py-2 rounded-full w-fit font-switzer font-medium text-[16px] text-[var(--dark-green)] tracking-[1px]">
                                    Notre histoire
                                </span>
                                <h1 className="font-montserrat font-bold text-[36px] lg:text-[80px] leading-[1.1] text-[var(--light-blue)]">
                                    Quand la confiance devient le point de départ
                                </h1>
                            </div>
                        </div>
                        {/* Right: Text content */}
                        <div className="lg:flex-1 lg:w-1/2 bg-white border-[5px] border-t-0 lg:border-t-[5px] lg:border-l-0 border-[var(--black)] rounded-b-[32px] lg:rounded-r-[32px] lg:rounded-bl-none p-8 lg:p-12 flex items-center">
                            <div className="font-poppins text-[16px] lg:text-[18px] leading-[1.8] text-[var(--black)]">
                                <p className="mb-4 lg:mb-6">
                                    RutaFem est née d&apos;un besoin personnel : celui de voyager
                                    librement, sans peur ni stress. Je vivais dans une ville de
                                    montagne, où le bus était souvent la seule option pour rejoindre
                                    les grandes villes. Partager une voiture semblait une belle
                                    alternative — plus pratique, plus humaine.
                                </p>
                                <p className="mb-4 lg:mb-6">
                                    Mais traverser la montagne avec un inconnu ne me mettait pas en
                                    confiance. Je savais que je n&apos;étais pas la seule à
                                    ressentir cela.
                                </p>
                                <p className="mb-4 lg:mb-6">
                                    Pour certaines, voyager, c&apos;est une passion. Pour
                                    d&apos;autres, c&apos;est une nécessité — un entretien, un
                                    retour en famille, un trajet qu&apos;on ne peut pas repousser.
                                </p>
                                <p className="mb-4 lg:mb-6">
                                    C&apos;est de là qu&apos;est née RutaFem : une plateforme de
                                    covoiturage 100 % féminine, pensée pour que chaque femme puisse
                                    voyager en sécurité, partager les frais et se sentir sereine.
                                </p>
                                <p>
                                    RutaFem, c&apos;est une autre façon de bouger — plus sûre, plus
                                    solidaire, plus respectueuse.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safe & Simple Section */}
            <section className="mb-12 md:mb-16">
                <div className="wrapper">
                    <div className="bg-[var(--pink)] border-[5px] border-[var(--black)] rounded-[32px] px-8 lg:px-14 py-16 lg:py-20">
                        <div className="flex flex-col gap-8">
                            {/* Header with icon */}
                            <div className="flex items-center gap-4">
                                <div className="bg-[var(--dark-green)] rounded-full size-20 flex items-center justify-center shrink-0">
                                    <Icon
                                        name="shield"
                                        width={40}
                                        height={40}
                                        strokeColor="var(--white)"
                                        fillColor="none"
                                    />
                                </div>
                                <h2 className="font-montserrat font-bold text-[36px] lg:text-[50px] text-[var(--dark-green)]">
                                    Safe & Simple
                                </h2>
                            </div>
                            {/* Content */}
                            <div className="font-poppins text-[18px] leading-[1.8] text-[var(--dark-green)] p-2">
                                <p className="mb-4">
                                    Avec RutaFem, chaque trajet devient une expérience sereine et
                                    confiante. Grâce à des profils vérifiés et une communauté
                                    bienveillante, nous créons un environnement où la confiance est
                                    au cœur de chaque échange.
                                </p>
                                <p className="mb-4">
                                    Imaginez partager la route avec des femmes qui, comme vous,
                                    cherchent des trajets sûrs et enrichissants. Chaque détail de
                                    l&apos;application est pensé pour que vous voyagiez
                                    l&apos;esprit léger : connectée à vos proches et entourée
                                    d&apos;une communauté solidaire.
                                </p>
                                <p>Voyager en sécurité, c&apos;est aussi voyager avec sérénité.</p>
                            </div>
                            {/* Button */}
                            <div className="self-start">
                                <Button text="Rejoins un trajet" color="yellow" link="/join-trip" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Communauté sororale Section */}
            <section className="mb-12 md:mb-16">
                <div className="wrapper">
                    <div className="bg-[var(--orange)] border-[5px] border-[var(--black)] rounded-[32px] px-8 lg:px-14 py-16 lg:py-20">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                            {/* Left: Content */}
                            <div className="flex-1 flex flex-col gap-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 rounded-full size-20 flex items-center justify-center shrink-0">
                                        <Icon
                                            name="heart"
                                            width={40}
                                            height={40}
                                            strokeColor="var(--white)"
                                            fillColor="none"
                                        />
                                    </div>
                                    <h2 className="font-montserrat font-bold text-[32px] lg:text-[40px] leading-[1.2] text-[var(--white)]">
                                        Une communauté sororale
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-4 p-2">
                                    <p className="font-poppins text-[24px] leading-[1.8] text-white">
                                        &quot;Plus qu&apos;un trajet, une rencontre.&quot;
                                    </p>
                                    <div className="font-poppins text-[18px] leading-[1.8] text-white">
                                        <p className="mb-4">
                                            Chez RutaFem, chaque trajet est bien plus qu&apos;un
                                            simple déplacement : c&apos;est une opportunité de
                                            rencontre et de partage.
                                        </p>
                                        <p className="mb-4">
                                            Rejoignez une communauté de voyageuses bienveillantes où
                                            chacune peut échanger des conseils, partager des bons
                                            plans et créer des liens en toute confiance.
                                        </p>
                                        <p>
                                            Ici, voyager rime avec simplicité et convivialité, dans
                                            une ambiance chaleureuse et respectueuse. Ensemble, nous
                                            transformons chaque trajet en une expérience
                                            enrichissante et humaine.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Right: Image */}
                            <div className="flex-1 relative min-h-[400px] lg:min-h-[584px] rounded-[24px] border-white overflow-hidden">
                                <Image
                                    src={ThreeWomanBack}
                                    alt="Trois femmes de dos"
                                    fill
                                    className="rounded-[22px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="mb-12 md:mb-16 relative">
                <div className="wrapper">
                    <div className="flex flex-col gap-16 items-center">
                        {/* Header */}
                        <div className="flex flex-col gap-4 items-center text-center">
                            <span className="bg-[var(--blue)] px-6 py-2 rounded-full flex items-center gap-2">
                                <Icon
                                    name="doublePerson"
                                    width={24}
                                    height={24}
                                    strokeColor="var(--white)"
                                />
                                <span className="font-switzer font-medium text-[16px] text-white tracking-[1px]">
                                    Notre équipe
                                </span>
                            </span>
                            <h2 className="font-montserrat font-bold text-[36px] lg:text-[50px] text-[var(--dark-green)]">
                                L&apos;équipe RutaFem
                            </h2>
                            <p className="font-poppins text-[18px] text-[var(--dark-green)]/70 max-w-[600px]">
                                Une équipe passionnée et engagée pour créer une mobilité plus sûre
                                et solidaire
                            </p>
                        </div>

                        {/* Team Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                            {teamMembers.map((member) => (
                                <TeamMemberCard key={member.name} {...member} />
                            ))}
                        </div>

                        {/* CTA Button */}
                        <Button text="Rejoins la communauté" color="yellow" link="/auth/profile" />
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="mb-12 md:mb-16">
                <div className="wrapper">
                    <QuoteSection
                        quote="Chaque trajet est plus qu'un déplacement : c'est une expérience de confiance et de communauté"
                        author="Melina Lázaro"
                        role="Fondatrice"
                    />
                </div>
            </section>
        </main>
    );
}
