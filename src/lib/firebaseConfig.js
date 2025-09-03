import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBpx3kPFQ5s-c52q8zgue64xDozYv5Mxuk',
    authDomain: 'rutafem-b1689.firebaseapp.com',
    projectId: 'rutafem-b1689',
    storageBucket: 'rutafem-b1689.firebasestorage.app',
    messagingSenderId: '785513653442',
    appId: '1:785513653442:web:1e980eabcd6db4546ac75b',
    measurementId: 'G-EYTT78CL08',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
