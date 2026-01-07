import { SourcesSection } from '@/components/sources-section';
import Button from '@/components/ui/button';
import { SecurityCard } from '@/components/ui/cards/security-card';

export default function ConfianceEtSecuritePage() {
    const securityCards = [
        {
            title: 'Parce que ta sécurité est notre priorité',
            content: [
                "Chez RutaFem, chaque détail de notre plateforme est pensé pour que tu puisses voyager l'esprit tranquille.",
                "Nous savons que pour beaucoup de femmes, le choix d'un moyen de transport dépend avant tout du sentiment de sécurité.",
                "C'est pourquoi tous les profils sont soigneusement vérifiés par notre équipe avant de pouvoir proposer ou rejoindre un trajet.",
                'Ensemble, nous faisons du covoiturage une expérience fiable, bienveillante et sereine.',
            ],
            bgColor: 'bg-[var(--blue)]',
            textColor: 'text-[var(--white)]',
            iconBgColor: 'bg-[var(--pink)]',
            iconName: 'shield',
            iconColor: 'var(--dark-green)',
        },
        {
            title: 'Des profils 100 % vérifiés, pour des trajets en toute confiance',
            content: [
                'Avant de rejoindre la communauté, chaque utilisatrice passe par une vérification rigoureuse :',
                "• Pièce d'identité (obligatoire pour toutes) ;",
                '• Permis de conduire (pour les conductrices) ;',
                '• Validation manuelle par notre équipe, sans automatisme.',
                "Ce contrôle humain garantit l'authenticité de chaque profil et protège la communauté contre les faux comptes.",
                'Une fois validé, ton profil reçoit le badge « Vérifié par RutaFem », visible par toutes les voyageuses.',
            ],
            bgColor: 'bg-[var(--pink)]',
            textColor: 'text-[var(--dark-green)]',
            iconBgColor: 'bg-[var(--white)]',
            iconName: 'outlineSvg',
            iconColor: 'var(--dark-green)',
            iconFilled: false,
        },
        {
            title: 'Une messagerie privée, pour échanger en toute sécurité',
            content: [
                'Les coordonnées personnelles sont toujours protégées.',
                'Tu peux échanger avec ta conductrice ou ta passagère uniquement après la confirmation du trajet.',
                'Ainsi, les conversations restent entre femmes et dans un espace sécurisé.',
                'Et si tu constates un comportement inapproprié, un bouton « Signaler » est disponible à tout moment.',
                'Notre équipe intervient rapidement pour garantir un climat de respect et de bienveillance.',
            ],
            bgColor: 'bg-[var(--white)]',
            textColor: 'text-[var(--dark-green)]',
            iconBgColor: 'bg-[var(--blue)]',
            iconName: 'messageOutline',
            iconColor: 'var(--white)',
        },
        {
            title: 'Des retours qui renforcent la confiance',
            content: [
                'Après chaque trajet, conductrices et voyageuses peuvent se laisser une note et un commentaire.',
                'Ces retours nourrissent la réputation de chaque profil et aident toute la communauté à choisir en confiance.',
                'Plus nous partageons nos expériences, plus nos trajets deviennent sûrs et agréables.',
            ],
            bgColor: 'bg-[var(--yellow)]',
            textColor: 'text-[var(--dark-green)]',
            iconBgColor: 'bg-[var(--dark-green)]',
            iconName: 'star',
            iconColor: 'var(--white)',
            iconStrokeWidth: 1,
        },
        {
            title: 'Ensemble, on fait bouger les lignes',
            content: [
                "RutaFem, c'est bien plus qu'une application de covoiturage.",
                "C'est le fruit de plusieurs années de recherche et d'écoute, pour créer une solution pensée par et pour les femmes.",
                'Notre objectif : faire du voyage un moment de plaisir, de liberté et non de stress.',
                "Au-delà du service, c'est une communauté solidaire qui prouve qu'on peut se déplacer autrement — dans le respect, la sécurité et la bienveillance.",
                "Parce que se sentir en sécurité, c'est ce qui rend le voyage vraiment libre.",
                'Pour la conception de notre plateforme, nous nous sommes appuyées sur plusieurs études et sources officielles, que vous pouvez consulter à la fin de cette page.',
            ],
            bgColor: 'bg-[var(--orange)]',
            textColor: 'text-[var(--white)]',
            iconBgColor: 'bg-[var(--yellow)]',
            iconName: 'heart',
            iconColor: 'var(--dark-green)',
        },
    ];

    const sources = [
        'ADEME (2025), Enquête nationale sur le covoiturage',
        'Ministère de la Transition écologique (2024), Violences sexistes et sexuelles dans les transports publics – bilan annuel 2023',
        'Vie-Publique.fr (2024), Les femmes premières victimes de violences dans les transports',
        'Observatoire du covoiturage (2025)',
    ];

    return (
        <main>
            <section className="section-margin">
                <div className="wrapper flex flex-col gap-10 items-center pt-20">
                    <div className="flex flex-col gap-4 items-center w-full max-w-[1240px]">
                        <h1 className="font-poppins font-bold text-[70px] text-[var(--dark-green)] text-center">
                            Confiance & sécurité
                        </h1>
                        <p className="font-poppins text-[24px] leading-[40.8px] text-[var(--dark-green)] text-center max-w-[900px]">
                            Voyager en toute sérénité, c&apos;est ce que nous te garantissons chez
                            RutaFem.
                        </p>
                    </div>

                    <div className="flex flex-col gap-10 items-center w-full max-w-[1240px]">
                        {securityCards.map((card, index) => (
                            <SecurityCard key={index} {...card} />
                        ))}

                        <SourcesSection sources={sources} />

                        <div className="flex justify-center w-full">
                            <Button
                                text="Rejoins la communauté"
                                color="yellow"
                                fill
                                link="/join-trip"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
