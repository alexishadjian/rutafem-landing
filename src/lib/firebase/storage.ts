import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebaseConfig';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']);

export const assertValidFile = (file: File, label: string) => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${label} doit faire moins de 5MB`);
    }
    if (!ALLOWED_TYPES.has(file.type)) {
        throw new Error(`${label} doit être au format JPG, PNG ou PDF`);
    }
};

export const timestampedFileName = (prefix: string, fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? 'bin';
    return `${prefix}_${Date.now()}.${extension}`;
};

export const buildStoragePath = (segments: string[]): string => segments.join('/');

export const uploadFile = async (path: string, file: File): Promise<string> => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
};
