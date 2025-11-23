import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const DEFAULT_ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
] as const;

type FileValidatorOptions = {
    maxSize?: number;
    allowedTypes?: readonly string[];
    label?: string;
};

const fileInstanceSchema = z.custom<File>((value) => value instanceof File, {
    message: 'Fichier invalide',
});

export const createFileSchema = (options: FileValidatorOptions = {}) => {
    const {
        maxSize = MAX_UPLOAD_BYTES,
        allowedTypes = DEFAULT_ALLOWED_FILE_TYPES,
        label,
    } = options;
    return fileInstanceSchema
        .refine((file) => file.size <= maxSize, {
            message: `${label ?? 'Le fichier'} doit faire moins de ${Math.round(
                maxSize / (1024 * 1024),
            )}MB`,
        })
        .refine((file) => allowedTypes.includes(file.type), {
            message: `${label ?? 'Le fichier'} doit être au format ${allowedTypes
                .map((type) => type.replace('image/', '').toUpperCase())
                .join(', ')}`,
        });
};

export const verificationDocumentsSchema = z.object({
    idCardFront: createFileSchema({ label: 'La carte avant' }),
    idCardBack: createFileSchema({ label: 'La carte arrière' }),
    driverLicense: createFileSchema({ label: 'Le permis de conduire' }).optional(),
});

export const driverLicenseSchema = z.object({
    licenseFront: createFileSchema({ label: 'Le permis recto' }),
    licenseBack: createFileSchema({ label: 'Le permis verso' }),
});

export const registerUserSchema = z
    .object({
        email: z.email("Format d'email invalide"),
        password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
        confirmPassword: z.string(),
        firstName: z.string().min(1, 'Prénom requis'),
        lastName: z.string().min(1, 'Nom requis'),
        phoneNumber: z.string().min(6, 'Numéro de téléphone requis'),
        acceptTerms: z.boolean().refine((value) => value, {
            message:
                'Vous devez accepter les conditions générales de vente et la politique de confidentialité pour créer un compte',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
    });

export const createTripSchema = z.object({
    departureTime: z.string().min(1, "L'heure de départ est requise"),
    departureDate: z.string().min(1, 'La date de départ est requise'),
    departureCity: z.string().min(1, 'La ville de départ est requise'),
    arrivalCity: z.string().min(1, "La ville d'arrivée est requise"),
    arrivalAddress: z.string().min(1, "Adresse d'arrivée requise"),
    departureLatitude: z.number(),
    departureLongitude: z.number(),
    arrivalLatitude: z.number(),
    arrivalLongitude: z.number(),
    totalSeats: z.coerce.number().int().positive('Le nombre de places doit être supérieur à 0'),
    pricePerSeat: z.coerce.number().positive('Le prix doit être supérieur à 0'),
    departureAddress: z.string().min(1, 'Adresse de départ requise'),
    description: z.string().optional(),
});

// french license plate verification regex
const FRENCH_LICENSE_PLATE_REGEX = /^([A-Z]{2}-\d{3}-[A-Z]{2}|\d{3,4}\s?[A-Z]{2,3}\s?\d{2})$/i;

export const vehicleSchema = z.object({
    licensePlate: z
        .string()
        .min(1, "La plaque d'immatriculation est requise")
        .refine((plate) => FRENCH_LICENSE_PLATE_REGEX.test(plate.replace(/\s+/g, ' ').trim()), {
            message: 'Format de plaque invalide. Format attendu : AB-123-CD ou 1234 AB 12',
        }),
    brand: z
        .string()
        .min(1, 'La marque est requise')
        .min(2, 'La marque doit contenir au moins 2 caractères'),
    model: z
        .string()
        .min(1, 'Le modèle est requis')
        .min(2, 'Le modèle doit contenir au moins 2 caractères'),
    color: z.string().min(1, 'La couleur est requise'),
});
