import { HeroBanner } from '@/public/images';
import Image from 'next/image';

type WelcomeStepProps = {
    onNext: () => void;
};

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="p-6 mt-10">
            <div className="bg-gray-100 rounded-3xl p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
                    <div className="flex justify-center lg:justify-start mb-6 lg:mb-0 lg:flex-1">
                        <Image
                            src={HeroBanner}
                            alt="Bienvenue sur RutaFem !"
                            sizes="(max-width: 1024px) 100vw, 600px"
                            style={{ objectFit: 'cover' }}
                            width={600}
                            height={600}
                            className="rounded-2xl w-full h-auto"
                        />
                    </div>

                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 lg:flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold font-montserrat text-[--accent-color]">
                            Bienvenue !
                        </h2>

                        <p className="text-base md:text-lg text-gray-700 max-w-2xl leading-relaxed">
                            Ici, tu peux proposer ton trajet de covoiturage. Plus nous partageons,
                            plus nous rendons les voyages accessibles, sûrs et solidaires. 💜
                        </p>

                        <button
                            onClick={onNext}
                            className="btn mt-4 px-8 py-3 text-base md:text-lg"
                        >
                            Commencer →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
