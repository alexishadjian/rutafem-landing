import Icon from '@/app/_components/ui/icon';

export const VerificationStatus = () => {
    return (
        <div className="bg-[var(--orange)] rounded-lg border border-[var(--dark-green)] p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <Icon
                        name="verificationShield"
                        width={30}
                        height={30}
                        fillColor="none"
                        strokeColor="var(--white)"
                    />
                </div>
                <div className="flex-1 space-y-2 text-white">
                    <h3 className="text-lg font-semibold">Vérification en cours</h3>
                    <div className="space-y-2 text-xs leading-normal font-light">
                        <p>
                            Vos documents ont bien été envoyés et sont en cours de vérification par
                            notre équipe.
                        </p>
                        <p>Vous recevrez une notification dès que la vérification sera terminée.</p>
                        <p>
                            Cette étape est essentielle pour garantir que chaque profil de la
                            communauté RutaFem soit authentique et digne de confiance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
