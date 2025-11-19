'use client';

import { loginUser } from '@/lib/firebase/auth';
import { WomanFacingMountain } from '@/public/images';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await loginUser(email, password);
            router.push('/auth/profile');
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--dark-green)] flex-1 flex flex-col py-8 px-4">
            <div className="md:wrapper wrapper flex-1 flex items-center justify-center">
                <div className="w-full max-w-5xl rounded-3xl bg-[var(--white)] overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Left side - Image */}
                        <div className="hidden md:block relative h-full min-h-[600px] p-1">
                            <div className="relative h-full w-full rounded-l-3xl overflow-hidden">
                                <Image
                                    src={WomanFacingMountain}
                                    alt="Femmes face aux montagnes"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Right side - Form */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-8">
                                <h2 className="text-3xl md:text-4xl font-semibold text-[var(--black)] mb-3 font-staatliches">
                                    BIENVENUE !
                                </h2>
                                <p className="text-[var(--black)] text-sm">
                                    Veuillez entrer vos informations pour vous connecter 💜
                                </p>
                            </div>

                            <div className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-[var(--black)] mb-2"
                                        >
                                            Adresse e-mail <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="vous@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-[var(--black)] mb-2"
                                        >
                                            Mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Entrez votre mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--pink)] focus:border-transparent transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <svg
                                                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm font-medium text-[var(--black)] bg-[var(--pink)] opacity-90 hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span>Connexion...</span>
                                            </div>
                                        ) : (
                                            'Me connecter'
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-6">
                                    <p className="text-sm text-[var(--black)]">
                                        Pas encore de compte ?{' '}
                                        <Link
                                            href="/auth/register"
                                            className="font-medium text-[var(--orange)] hover:text-[var(--pink)] transition-colors duration-200"
                                        >
                                            Créer un compte
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
