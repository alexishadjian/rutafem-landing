import { villes } from '@/datas/villes';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://rutafem.com',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://rutafem.com/covoiturage',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: 'https://rutafem.com/conditions-generales-de-vente',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://rutafem.com/mentions-legales',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://rutafem.com/politique-de-confidentialite',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...villes.map((ville) => ({
            url: `https://rutafem.com/covoiturage/${ville.slug}`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.8,
        })),
        {
            url: 'https://rutafem.com/join-trip',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.9,
        },
        {
            url: 'https://rutafem.com/create-trip',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: 'https://rutafem.com/auth/login',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: 'https://rutafem.com/auth/register',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: 'https://rutafem.com/auth/profile',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: 'https://rutafem.com/auth/profile/verification',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://rutafem.com/auth/profile/driver-license',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://rutafem.com/verification-required',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
