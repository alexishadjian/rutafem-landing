'use client';

import Icon from '@/app/_components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { uploadDriverLicenseDocuments } from '@/lib/firebase/users';
import { createOrUpdateVehicle } from '@/lib/firebase/vehicles';
import { createFileSchema, vehicleSchema } from '@/utils/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function DriverLicenseVerificationPage() {
    const { user, userProfile, loading, refreshUserProfile } = useAuth();
    const router = useRouter();

    const [licenseFront, setLicenseFront] = useState<File | null>(null);
    const [licenseBack, setLicenseBack] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Vehicle information
    const [licensePlate, setLicensePlate] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [color, setColor] = useState('');

    const { frontSchema, backSchema } = useMemo(
        () => ({
            frontSchema: createFileSchema({ label: 'Le permis recto' }),
            backSchema: createFileSchema({ label: 'Le permis verso' }),
        }),
        [],
    );

    // redirect to login if not authenticated
    useEffect(() => {
        if (!loading && (!user || !userProfile)) {
            router.push('/auth/login');
        }
    }, [user, userProfile, loading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (file) {
            const schema = type === 'front' ? frontSchema : backSchema;
            const parsed = schema.safeParse(file);
            if (!parsed.success) {
                setError(parsed.error.issues[0]?.message ?? 'Fichier invalide');
                return;
            }

            if (type === 'front') setLicenseFront(parsed.data);
            if (type === 'back') setLicenseBack(parsed.data);
            setError('');
        }
    };

    const removeFile = (type: 'front' | 'back') => {
        if (type === 'front') setLicenseFront(null);
        if (type === 'back') setLicenseBack(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userProfile) {
            setError('Vous devez être connecté pour effectuer cette action');
            return;
        }

        if (!licenseFront || !licenseBack) {
            setError('Veuillez sélectionner les deux faces de votre permis de conduire');
            return;
        }

        const vehicleValidation = vehicleSchema.safeParse({
            licensePlate,
            brand,
            model,
            color,
        });

        if (!vehicleValidation.success) {
            const firstError = vehicleValidation.error.issues[0];
            setError(firstError?.message ?? 'Données du véhicule invalides');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await uploadDriverLicenseDocuments(user.uid, licenseFront, licenseBack);

            await createOrUpdateVehicle(user.uid, {
                licensePlate: licensePlate.toUpperCase().replace(/\s+/g, ' ').trim(),
                brand: brand.trim(),
                model: model.trim(),
                color,
            });

            setSuccess(
                'Documents de permis et informations du véhicule envoyés avec succès ! Votre permis sera vérifié par notre équipe.',
            );

            // update user profile
            await refreshUserProfile();

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
            <div className="bg-[var(--white)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    // if not authenticated, display nothing (the redirection is done in useEffect)
    if (!user || !userProfile) {
        return null;
    }

    return (
        <div className="bg-[var(--white)] py-8 px-4">
            <div className="md:wrapper wrapper">
                <div className="text-start py-6">
                    <h2 className="text-3xl md:text-4xl font-semibold text-[var(--black)] font-staatliches">
                        Vérification du permis de conduire
                    </h2>
                    <p className="text-[var(--black)] mt-2">
                        Bonjour {userProfile.firstName} ! Pour devenir chauffeuse et proposer des
                        trajets, nous devons vérifier ton permis de conduire.
                    </p>

                    <div className="mt-4 p-4 bg-[var(--orange)] text-white rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-shrink-0 bg-white rounded-full p-2">
                                <Icon
                                    name="lock"
                                    width={20}
                                    height={20}
                                    strokeColor="none"
                                    fillColor="var(--black)"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-medium mb-1 tracking-wide">
                                    Sécurité avant tout
                                </p>
                                <p className="text-sm font-light">
                                    Ton permis sert juste à confirmer que tu peux conduire en toute
                                    sécurité ! Une fois vérifié, on supprime les photos et on garde
                                    juste l&apos;info que tu es une super chauffeuse ✨
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[var(--dark-green)] rounded-3xl p-8 mb-0">
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
                            <h3 className="text-lg font-semibold text-gray-900">
                                Permis de conduire
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="licenseFront"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Permis de conduire recto{' '}
                                            <span className="text-pink-500">*</span>
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors duration-200">
                                            <div className="space-y-1 text-center">
                                                {licenseFront ? (
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
                                                                {licenseFront.name}
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
                                                                htmlFor="licenseFront"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--orange)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--orange)]"
                                                            >
                                                                <span>Télécharger un fichier</span>
                                                                <input
                                                                    id="licenseFront"
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
                                            htmlFor="licenseBack"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Permis de conduire verso
                                            <span className="text-pink-500">*</span>
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors duration-200">
                                            <div className="space-y-1 text-center">
                                                {licenseBack ? (
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
                                                                {licenseBack.name}
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
                                                                htmlFor="licenseBack"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--orange)] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--orange)]"
                                                            >
                                                                <span>Télécharger un fichier</span>
                                                                <input
                                                                    id="licenseBack"
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
                        </div>

                        <div className="p-8 space-y-6">
                            <h4 className="text-xl font-semibold text-[var(--white)]">
                                Informations de la voiture
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="licensePlate"
                                        className="block text-sm font-medium text-[var(--white)] mb-2"
                                    >
                                        Numéro de plaque d&apos;immatriculation{' '}
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <input
                                        id="licensePlate"
                                        type="text"
                                        value={licensePlate}
                                        onChange={(e) => setLicensePlate(e.target.value)}
                                        placeholder="Ex: AA-000-AA"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent transition-colors"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="brand"
                                        className="block text-sm font-medium text-[var(--white)] mb-2"
                                    >
                                        Marque de la voiture{' '}
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <input
                                        id="brand"
                                        type="text"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        placeholder="Ex: Renault"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="model"
                                        className="block text-sm font-medium text-[var(--white)] mb-2"
                                    >
                                        Modèle de la voiture{' '}
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <input
                                        id="model"
                                        type="text"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        placeholder="Ex: Clio"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent transition-colors"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="color"
                                        className="block text-sm font-medium text-[var(--white)] mb-2"
                                    >
                                        Couleur de la voiture{' '}
                                        <span className="text-pink-500">*</span>
                                    </label>
                                    <select
                                        id="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--orange)] focus:border-transparent transition-colors"
                                    >
                                        <option value="" disabled>
                                            Sélectionner une couleur
                                        </option>
                                        <option value="Noir">Noir</option>
                                        <option value="Blanc">Blanc</option>
                                        <option value="Gris">Gris</option>
                                        <option value="Argent">Argent</option>
                                        <option value="Bleu">Bleu</option>
                                        <option value="Rouge">Rouge</option>
                                        <option value="Vert">Vert</option>
                                        <option value="Jaune">Jaune</option>
                                        <option value="Orange">Orange</option>
                                        <option value="Marron">Marron</option>
                                        <option value="Beige">Beige</option>
                                        <option value="Violet">Violet</option>
                                        <option value="Rose">Rose</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex justify-center items-center py-3 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--pink)] opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--pink)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {uploading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--black)]"
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
                                            <span className="text-[var(--black)]">
                                                Envoi en cours...
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-base text-[var(--black)]">
                                            Envoyer les documents
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="text-center">
                                <p className="text-base text-gray-600">
                                    <Link
                                        href="/auth/profile"
                                        className="font-medium text-[var(--orange)] hover:text-[var(--pink)] transition-colors duration-200"
                                    >
                                        Retour au profil
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
