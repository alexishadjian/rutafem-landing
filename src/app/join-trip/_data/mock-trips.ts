export type Trip = {
    id: string;
    driver: {
        name: string;
        initial: string;
    };
    route: {
        departure: string;
        arrival: string;
    };
    price: number;
    date: string;
    time: string;
    availableSeats: number;
};

export const mockTrips: Trip[] = [
    {
        id: '1',
        driver: {
            name: 'Marie',
            initial: 'M',
        },
        route: {
            departure: 'Paris',
            arrival: 'Lyon',
        },
        price: 35,
        date: 'mer. 15 janv.',
        time: '14:00',
        availableSeats: 2,
    },
    {
        id: '2',
        driver: {
            name: 'Sophie',
            initial: 'S',
        },
        route: {
            departure: 'Marseille',
            arrival: 'Nice',
        },
        price: 25,
        date: 'jeu. 16 janv.',
        time: '09:30',
        availableSeats: 3,
    },
    {
        id: '3',
        driver: {
            name: 'Emma',
            initial: 'E',
        },
        route: {
            departure: 'Bordeaux',
            arrival: 'Toulouse',
        },
        price: 20,
        date: 'ven. 17 janv.',
        time: '16:15',
        availableSeats: 1,
    },
    {
        id: '4',
        driver: {
            name: 'Claire',
            initial: 'C',
        },
        route: {
            departure: 'Lille',
            arrival: 'Paris',
        },
        price: 30,
        date: 'sam. 18 janv.',
        time: '08:45',
        availableSeats: 2,
    },
    {
        id: '5',
        driver: {
            name: 'Léa',
            initial: 'L',
        },
        route: {
            departure: 'Nantes',
            arrival: 'Rennes',
        },
        price: 15,
        date: 'dim. 19 janv.',
        time: '11:00',
        availableSeats: 3,
    },
    {
        id: '6',
        driver: {
            name: 'Julie',
            initial: 'J',
        },
        route: {
            departure: 'Strasbourg',
            arrival: 'Nancy',
        },
        price: 18,
        date: 'lun. 20 janv.',
        time: '17:30',
        availableSeats: 1,
    },
];
