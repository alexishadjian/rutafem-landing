import { Vehicle, VehicleDoc } from '@/types/vehicles.types';
import { logFirebaseError } from '@/utils/errors';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Create or update vehicle for a user
export const createOrUpdateVehicle = async (
    userId: string,
    vehicleData: Omit<VehicleDoc, 'created_at' | 'updated_at'>,
): Promise<string> => {
    try {
        // Check if user already has a vehicle
        const existingVehicle = await getUserVehicle(userId);

        if (existingVehicle) {
            // Update existing vehicle
            await updateDoc(doc(db, 'vehicles', existingVehicle.id), {
                ...vehicleData,
                updated_at: serverTimestamp(),
            });
            return existingVehicle.id;
        } else {
            // Create new vehicle
            const vehicleRef = await addDoc(collection(db, 'vehicles'), {
                userId,
                ...vehicleData,
                created_at: serverTimestamp(),
            });
            return vehicleRef.id;
        }
    } catch (error) {
        logFirebaseError('createOrUpdateVehicle', error);
        throw new Error('Erreur lors de la sauvegarde des informations du véhicule');
    }
};

// Get vehicle by user ID
export const getUserVehicle = async (userId: string): Promise<Vehicle | null> => {
    try {
        const q = query(collection(db, 'vehicles'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            userId: doc.data().userId,
            vehicle: {
                brand: doc.data().brand,
                model: doc.data().model,
                color: doc.data().color,
                licensePlate: doc.data().licensePlate,
                created_at: doc.data().created_at,
                updated_at: doc.data().updated_at,
            },
        };
    } catch (error) {
        logFirebaseError('getUserVehicle', error);
        throw new Error('Erreur lors de la récupération du véhicule');
    }
};

// Get vehicle by ID
export const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
    try {
        const vehicleDoc = await getDoc(doc(db, 'vehicles', vehicleId));

        if (!vehicleDoc.exists()) {
            return null;
        }

        return {
            id: vehicleDoc.id,
            userId: vehicleDoc.data().userId,
            vehicle: {
                brand: vehicleDoc.data().brand,
                model: vehicleDoc.data().model,
                color: vehicleDoc.data().color,
                licensePlate: vehicleDoc.data().licensePlate,
                created_at: vehicleDoc.data().created_at,
                updated_at: vehicleDoc.data().updated_at,
            },
        };
    } catch (error) {
        logFirebaseError('getVehicleById', error);
        throw new Error('Erreur lors de la récupération du véhicule');
    }
};
