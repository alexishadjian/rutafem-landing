import { Timestamp } from 'firebase/firestore';

const normalizeDate = (value: string | Date): Date =>
    typeof value === 'string' ? new Date(value) : value;

export const formatDate = (
    value: string | Date,
    options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    },
    locale = 'fr-FR',
): string => normalizeDate(value).toLocaleDateString(locale, options);

export const formatShortDate = (
    value: string | Date,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
    },
    locale = 'fr-FR',
): string => normalizeDate(value).toLocaleDateString(locale, options);

export const formatTime = (
    value: string | Date,
    options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
    locale = 'fr-FR',
): string => normalizeDate(value).toLocaleTimeString(locale, options);

export const timestampToDate = (value?: Timestamp | Date): Date =>
    value instanceof Timestamp ? value.toDate() : value ?? new Date();
