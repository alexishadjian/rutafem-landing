import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '../firebaseConfig';

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
