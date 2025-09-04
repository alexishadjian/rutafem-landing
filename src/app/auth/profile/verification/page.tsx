'use client';

import { useAuth } from '@/contexts/AuthContext';
import { uploadVerificationDocuments } from '@/lib/firebaseAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function VerificationPage() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const [idCardFront, setIdCardFront] = useState<File | null>(null);
    const [idCardBack, setIdCardBack] = useState<File | null>(null);
    const [driverLicense, setDriverLicense] = useState<File | null>(null);
    const [wantsToBeDriver, setWantsToBeDriver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'front' | 'back' | 'license',
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Le fichier doit faire moins de 5MB');
                return;
            }

            if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
                setError('Seuls les formats JPG, PNG et PDF sont acceptés');
                return;
            }

            if (type === 'front') {
                setIdCardFront(file);
            } else if (type === 'back') {
                setIdCardBack(file);
            } else if (type === 'license') {
                setDriverLicense(file);
            }
            setError('');
        }
    };

    const removeFile = (type: 'front' | 'back' | 'license') => {
        if (type === 'front') {
            setIdCardFront(null);
        } else if (type === 'back') {
            setIdCardBack(null);
        } else if (type === 'license') {
            setDriverLicense(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userProfile) {
            setError('Vous devez être connecté pour effectuer cette action');
            return;
        }

        if (!idCardFront || !idCardBack) {
            setError("Veuillez sélectionner les deux faces de votre carte d'identité");
            return;
        }

        if (wantsToBeDriver && !driverLicense) {
            setError('Veuillez sélectionner votre permis de conduire pour devenir chauffeuse');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await uploadVerificationDocuments(
                user.uid,
                idCardFront,
                idCardBack,
                wantsToBeDriver ? driverLicense || undefined : undefined,
            );

            setSuccess(
                'Documents envoyés avec succès ! Votre profil sera vérifié par notre équipe.',
            );

            setTimeout(() => {
                router.push('/auth/profile');
            }, 2000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user || !userProfile) {
        router.push('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">RutaFem</h1>
                    <h2 className="text-2xl font-semibold text-gray-700">Vérification de profil</h2>
                    <p className="text-gray-600 mt-2">
                        Bonjour {userProfile.firstName} ! Pour utiliser RutaFem en toute sécurité,
                        nous devons vérifier votre identité.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Carte d&apos;identité
                            </h3>
                            <p className="text-sm text-gray-600">
                                Pour votre sécurité et celle de la communauté, nous devons vérifier
                                votre identité.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="idCardFront"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Carte d&apos;identité recto{' '}
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors duration-200">
                                        <div className="space-y-1 text-center">
                                            {idCardFront ? (
                                                <div className="flex items-center space-x-2">
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-green-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex flex-col">
                                                        <p className="text-sm text-gray-600">
                                                            {idCardFront.name}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile('front')}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="idCardFront"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                                                        >
                                                            <span>Télécharger un fichier</span>
                                                            <input
                                                                id="idCardFront"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleFileChange(e, 'front')
                                                                }
                                                                required
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG jusqu&apos;à 5MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="idCardBack"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Carte d&apos;identité verso
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors duration-200">
                                        <div className="space-y-1 text-center">
                                            {idCardBack ? (
                                                <div className="flex items-center space-x-2">
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-green-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex flex-col">
                                                        <p className="text-sm text-gray-600">
                                                            {idCardBack.name}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile('back')}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="idCardBack"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                                                        >
                                                            <span>Télécharger un fichier</span>
                                                            <input
                                                                id="idCardBack"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleFileChange(e, 'back')
                                                                }
                                                                required
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG jusqu&apos;à 5MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    id="wantsToBeDriver"
                                    type="checkbox"
                                    checked={wantsToBeDriver}
                                    onChange={(e) => setWantsToBeDriver(e.target.checked)}
                                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-2 border-gray-600 rounded focus:border-pink-500 accent-pink-600"
                                    style={{ borderColor: '#4B5563' }}
                                />
                                <label
                                    htmlFor="wantsToBeDriver"
                                    className="ml-2 block text-sm text-gray-900"
                                >
                                    Je souhaite devenir chauffeuse et proposer des trajets
                                </label>
                            </div>

                            {wantsToBeDriver && (
                                <div>
                                    <label
                                        htmlFor="driverLicense"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Permis de conduire
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors duration-200">
                                        <div className="space-y-1 text-center">
                                            {driverLicense ? (
                                                <div className="flex items-center space-x-2">
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-green-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex flex-col">
                                                        <p className="text-sm text-gray-600">
                                                            {driverLicense.name}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile('license')}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label
                                                            htmlFor="driverLicense"
                                                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                                                        >
                                                            <span>Télécharger un fichier</span>
                                                            <input
                                                                id="driverLicense"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleFileChange(e, 'license')
                                                                }
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG jusqu&apos;à 5MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {uploading ? (
                                <div className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                    Envoi en cours...
                                </div>
                            ) : (
                                'Envoyer les documents'
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            <Link
                                href="/auth/profile"
                                className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-200"
                            >
                                Retour au profil
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
