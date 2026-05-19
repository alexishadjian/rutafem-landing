'use client';

import Button from '@/components/ui/button';
import { CardLine, TeamRutafem, UluleLogo } from '@/images';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import RotatingText from './ui/RotatingText';

const SLIDE_COUNT = 2;
const AUTO_PLAY_INTERVAL = 40000;
const TRANSITION_DURATION = 900;

export default function HeroCarousel() {
    const [activeSlide, setActiveSlide] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startAutoPlay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
        }, AUTO_PLAY_INTERVAL);
    }, []);

    useEffect(() => {
        startAutoPlay();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startAutoPlay]);

    const goToSlide = (index: number) => {
        setActiveSlide(index);
        startAutoPlay();
    };

    return (
        <section className="bg-[var(--dark-green)] relative overflow-hidden">
            <div
                className="flex transition-transform ease-in-out"
                style={{
                    transform: `translateX(-${activeSlide * 100}%)`,
                    transitionDuration: `${TRANSITION_DURATION}ms`,
                }}
            >
                {/* Slide 1 — Hero originale */}
                <div className="w-full flex-shrink-0 relative min-h-[100vh]">
                    <div className="absolute inset-0 flex-col gap-4 self-center overflow-hidden hidden md:flex">
                        <div className="flex gap-4 w-full animate-scroll-slow">
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                        </div>
                        <div className="flex gap-4 w-full animate-scroll-fast">
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                        </div>
                        <div className="flex gap-4 w-full animate-scroll-mid">
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                            <Image
                                src={CardLine}
                                alt="Carte réprésentant un trajet à destination de Lyon depuis Paris pour le 23 mai avec 3 passagères."
                                className="w-full flex-shrink-0 object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-[var(--dark-green)] from-0% via-[var(--dark-green)] via-50% to-transparent to-100% absolute inset-0 z-[0]"></div>

                    <div className="flex-col flex lg:items-start items-center justify-center min-h-[100vh] text-[var(--white)] relative wrapper pt-24 md:pt-0">
                        <div className="w-full lg:w-1/2 relative z-[1]">
                            <h1
                                className="font-montserrat text-[50px] lg:text-[60px] xl:text-[70px] font-bold leading-[1.2]"
                                aria-label="Le covoiturage 100% féminin, simple et safe"
                            >
                                <span className="pr-4">Le covoiturage 100%</span>
                                <RotatingText
                                    texts={['féminin', 'simple', 'safe']}
                                    mainClassName="px-2 sm:px-2 bg-[var(--yellow)] text-[var(--dark-green)] md:px-3 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                                    staggerFrom={'last'}
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '-120%' }}
                                    staggerDuration={0.025}
                                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                    transition={{
                                        type: 'spring',
                                        damping: 30,
                                        stiffness: 400,
                                    }}
                                    rotationInterval={2000}
                                />
                            </h1>
                            <p className="mb-8 text-[20px]">
                                Partage tes trajets entre femmes, en toute confiance, comme entre
                                copines. Simple et en sécurité.
                            </p>
                            <div className="flex gap-4 flex-wrap items-start pb-4">
                                <Button
                                    text="Rejoindre un trajet"
                                    color="pink"
                                    link="/join-trip"
                                    fill
                                />
                                <Button
                                    text="Publier un trajet"
                                    color="pink"
                                    link="/create-trip"
                                    fill
                                />
                            </div>
                        </div>
                        <div className="w-1/2"></div>
                    </div>
                </div>

                {/* Slide 2 — Ulule */}
                <div className="w-full flex-shrink-0 relative min-h-[100vh] flex items-center">
                    <div className="wrapper relative z-[1] flex flex-col lg:flex-row items-center gap-10 lg:gap-10 pt-24 lg:pt-0">
                        {/* Left — Text */}
                        <div className="w-full lg:w-[55%] text-[var(--white)] flex flex-col gap-6 items-start">
                            <span className="bg-[var(--orange)] text-[var(--white)] px-6 py-2 rounded-full text-lg font-medium border border-[var(--white)]">
                                Financement participatif
                            </span>
                            <h2 className="font-montserrat text-[36px] md:text-[44px] lg:text-[52px] xl:text-[60px] font-bold leading-[1.15]">
                                RutaFem existe grâce à vous. Et son avenir aussi.
                            </h2>
                            <p className="text-[18px] md:text-[20px] leading-relaxed opacity-90 font-poppins font-light">
                                Une équipe engagée et une communauté qui croit au projet. Il nous
                                manque une chose : votre soutien. Rejoignez notre cagnotte Ulule
                                et construisez cette aventure avec nous.
                            </p>
                            <a
                                href="https://fr.ulule.com/rutafem/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 px-10 py-5 rounded-xl text-xl inline-flex items-center justify-center gap-2 bg-[var(--yellow)] border-2 border-[var(--black)] text-[var(--dark-green)] font-semibold transition-all duration-300 hover:opacity-90"
                            >
                                Participer à la cagnotte
                            </a>
                        </div>

                        {/* Right — Team + Ulule logo */}
                        <div className="w-full lg:w-[45%] relative flex items-end justify-end self-end lg:ml-10 lg:translate-x-10">
                            <Image
                                src={UluleLogo}
                                alt="Logo de Ulule, plateforme de financement participatif"
                                aria-hidden="true"
                                className="absolute -top-20 md:-top-60 left-1/2 -translate-x-1/2 w-[250px] md:w-[550px] lg:w-[800px] h-auto opacity-70 object-contain"
                            />
                            <Image
                                src={TeamRutafem}
                                alt="L'équipe RutaFem réunie"
                                className="relative z-[1] w-full h-auto object-contain scale-105 lg:scale-[1.2] origin-bottom"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        aria-label={`Aller à la slide ${i + 1}`}
                        className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer border border-[var(--white)] ${
                            activeSlide === i
                                ? 'bg-[var(--white)] scale-110'
                                : 'bg-[var(--white)]/50 hover:bg-[var(--white)]/80'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
