import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('RESEND_API_KEY is not set');
}

export const resend = new Resend(resendApiKey);

export const EMAIL_FROM = 'RutaFem <noreply@rutafem.com>';
export const ADMIN_EMAIL = 'contact@rutafem.com';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rutafem.com';

