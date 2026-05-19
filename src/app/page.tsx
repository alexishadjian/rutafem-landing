import Button from '@/components/ui/button';
import FaqCard from '@/components/ui/cards/faqCard';
import ValueCard from '@/components/ui/cards/valueCard';
import WinnerCard from '@/components/ui/cards/winnerCard';
import Icon from '@/components/ui/icon';
import { RideIllu, StarIllu } from '@/images';
import Image from 'next/image';
import HeroCarousel from './_components/hero-carousel';

export default function Home() {
    return (
        <div className="home">
            <HeroCarousel />

            <section className="section-margin">
                <div className="wrapper flex flex-col gap-10 md:gap-20">
                    <div className="flex items-start gap-20">
                        <div className="w-1/4 aspect-[257/241] hidden md:block">
                            <Image
                                src={StarIllu}
                                alt="Dessin d'une étoile orange"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-full md:w-2/3" id="nous-connaitre">
                            <h2 className="uppercase text-[var(--dark-green)] font-staatliches text-[50px] md:text-[60px] lg:text-[70px] leading-[1.2]">
                                Notre rêve est de créer une mobilité{' '}
                                <span className="bg-[var(--orange)] text-[var(--white)]">
                                    sûre et solidaire, {/* */}
                                </span>
                                pensée par et pour les femmes.
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ValueCard
                            title="100% féminine et safe"
                            description="Chaque membre est vérifiée, pour que tu voyages entre femmes, en toute confiance et sérénité."
                            bgColor="bg-[var(--blue)]"
                        />
                        <ValueCard
                            title="Communauté bienveillante"
                            description="Plus qu'un trajet, une communauté qui te comprend."
                            bgColor="bg-[var(--orange)]"
                        />
                        <ValueCard
                            title="Voyager à petit prix"
                            description="Partage les frais, économise sur ton trajet et rends la mobilité accessible à toutes."
                            bgColor="bg-[var(--blue)]"
                        />
                        <ValueCard
                            title="Voyager plus écolo"
                            description="Chaque trajet partagé, cest un pas de plus vers une mobilité plus douce et responsable."
                            bgColor="bg-[var(--orange)]"
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            text="Je rejoins mon premier trajet"
                            color="yellow"
                            link="/join-trip"
                            fill
                        />
                    </div>
                </div>
            </section>

            <section className="section-margin bg-[var(--yellow)]">
                <div className="wrapper flex flex-col lg:flex-row gap-0 lg:gap-10">
                    <div className="w-full lg:w-1/2 flex flex-col gap-10 items-start pb-0 lg:pb-20 py-10 md:py-20">
                        <div>
                            <div className="flex gap-4 flex-wrap">
                                <span className="bg-[var(--black)] text-[var(--white)] px-6 py-2 rounded-full">
                                    100% féminin
                                </span>
                                <span className="bg-[var(--black)] text-[var(--white)] px-6 py-2 rounded-full">
                                    Partout en France
                                </span>
                            </div>
                            <h2 className="font-staatliches text-[50px] md:text-[70px] mt-12 leading-[1.2] md:leading-tight">
                                Propose ton trajet dès maintenant !
                            </h2>
                        </div>
                        <p>
                            Rejoins notre communauté de voyageuses et partage tes trajets en toute
                            sécurité. Aide d&apos;autres femmes à voyager sereinement tout en
                            partageant les frais.
                        </p>
                        <Button
                            text="Ajouter un nouveau trajet"
                            color="white"
                            link="/create-trip"
                            fill
                        />
                    </div>
                    <div className="w-4/6 lg:w-1/2 h-full lg:self-end self-center">
                        <Image
                            src={RideIllu}
                            alt="Deux amies souriantes tenant un appareil photo polaroid"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="bg-[var(--orange)] text-[var(--white)] overflow-hidden">
                    <span className="sr-only">
                        100% féminin · Profils vérifiés · Moins de stress · Eco-responsable · Plus
                        d&apos;économies
                    </span>
                    <div
                        className="flex items-center gap-4 p-4 animate-scroll-slow w-max"
                        aria-hidden="true"
                    >
                        {/* Première série */}
                        <span className="whitespace-nowrap">100% féminin</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Profils verifiés</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Moins de stress</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Eco-responsable</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Plus d&apos;économies</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        {/* Deuxième série */}
                        <span className="whitespace-nowrap">100% féminin</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Profils verifiés</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Moins de stress</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Eco-responsable</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Plus d&apos;économies</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        {/* Troisième série */}
                        <span className="whitespace-nowrap">100% féminin</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Profils verifiés</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Moins de stress</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Eco-responsable</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Plus d&apos;économies</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        {/* Quatrième série */}
                        <span className="whitespace-nowrap">100% féminin</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Profils verifiés</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Moins de stress</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Eco-responsable</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                        <span className="whitespace-nowrap">Plus d&apos;économies</span>
                        <Icon
                            className="shrink-0"
                            name="starIllu"
                            width={14}
                            height={14}
                            strokeWidth={0}
                            fillColor="var(--white)"
                        />
                    </div>
                </div>
            </section>

            <section className="section-margin">
                <div className="wrapper" id="securite">
                    <h2 className="font-staatliches text-[40px] md:text-[50px] lg:text-[60px] mb-10">
                        Comment
                        <br />{' '}
                        <span className="text-[var(--blue)] text-[60px] md:text-[70px] lg:text-[100px] leading-none">
                            ça marche ?
                        </span>
                    </h2>

                    <div className="flex flex-col gap-0 md:gap-4">
                        <FaqCard
                            number="1"
                            question="Propose ou rejoins un trajet"
                            answer={[
                                'Crée ton compte en quelques clics.',
                                "Chaque profil est vérifié par notre équipe grâce à une pièce d'identité - et au permis pour les conductrices - avant d'être validé.",
                                'Une vérification humaine, simple et essentielle pour voyager en confiance.',
                                'Tu veux conduire ? Propose ton trajet.',
                                'Tu préfères être passagère ? Rejoins celui qui te convient.',
                                'Simple, rapide, et toujours entre femmes.',
                            ]}
                        />
                        <FaqCard
                            question="Discute avec  les voyageuses"
                            answer={[
                                "Pour garantir la sécurité de toutes, les coordonnées ne sont partagées qu'après la confirmation du trajet. La conductrice et la passagère peuvent ensuite échanger librement pour planifier leur voyage.",
                            ]}
                            number="2"
                        />
                        <FaqCard
                            question="Profite de ton trajet safe et féminin"
                            answer={[
                                "Le jour du départ, partez l'esprit tranquille.",
                                'Après chaque trajet, conductrices et passagères partagent une évaluation sur leur expérience.',
                                'Ces retours contribuent à renforcer la transparence et la sécurité de notre communauté, pour des voyages toujours plus fiables.',
                            ]}
                            number="3"
                        />
                    </div>
                </div>
            </section>

            <section className="section-margin wrapper">
                <h2 className="font-staatliches text-[40px] md:text-[60px] mb-4 md:mb-10 uppercase">
                    Toutes Gagnantes
                </h2>

                <div className="flex flex-col md:flex-row gap-6">
                    <WinnerCard
                        type="conductrice"
                        title="Conductrice"
                        subtitle="Partage ton trajet, allège tes frais."
                        description={[
                            "En moyenne, une conductrice gagne environ 0,10 € par kilomètre en partageant son trajet¹ — soit jusqu'à 50 € ou plus par voyage selon la distance.",
                            "Chaque passagère à bord aide à amortir les coûts de carburant, de péage et d'entretien.",
                            "Résultat : tu voyages plus sereinement, tout en rendant service à d'autres femmes.",
                        ]}
                        bgColor="var(--orange)"
                        textColor="var(--white)"
                        buttonLink="/create-trip"
                        buttonText="Ajouter un nouveau trajet"
                    />
                    <WinnerCard
                        type="voyageuse"
                        title="Voyageuse"
                        subtitle="Voyage loin, sans vider ton porte-monnaie."
                        description={[
                            'En choisissant le covoiturage, tu économises en moyenne 0,10 € par kilomètre parcouru¹.',
                            "Sur un trajet de 300 km, cela représente environ 30 € d'économies, souvent jusqu'à 50 € ou plus sur certains voyages.",
                            'Près de 70 % des passagères utilisent le covoiturage à la place du train ou du bus — une alternative plus accessible et tout aussi conviviale.',
                        ]}
                        bgColor="var(--pink)"
                        textColor="var(--dark-green)"
                        buttonLink="/join-trip"
                        buttonText="Rejoindre un trajet"
                    />
                </div>
            </section>
        </div>
    );
}
