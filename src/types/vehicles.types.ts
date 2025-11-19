import { Timestamp } from 'firebase/firestore';

export type VehicleDoc = {
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    created_at: Timestamp | Date;
    updated_at?: Timestamp | Date;
};

export type Vehicle = {
    id: string;
    userId: string;
    vehicle: VehicleDoc;
};
