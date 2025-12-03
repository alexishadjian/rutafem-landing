// Calculate distance between two GPS coordinates using Haversine formula
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Price tiers based on distance (in km)
const PRICE_TIERS = [
    { maxKm: 50, price: 5 },
    { maxKm: 100, price: 7 },
    { maxKm: 150, price: 10 },
    { maxKm: 200, price: 12 },
    { maxKm: 300, price: 15 },
    { maxKm: 400, price: 20 },
    { maxKm: 500, price: 25 },
    { maxKm: Infinity, price: 30 },
];

// Get suggested price based on distance
export const getSuggestedPrice = (distanceKm: number): number => {
    if (distanceKm <= 0) return 0;
    const tier = PRICE_TIERS.find((t) => distanceKm <= t.maxKm);
    return tier?.price ?? PRICE_TIERS[PRICE_TIERS.length - 1].price;
};
