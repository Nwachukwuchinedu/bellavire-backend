import axios from 'axios';

/**
 * Distance calculation service using Google Maps API
 * Provides driving and walking distance/time calculations
 */
class DistanceService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    }

    /**
     * Calculate distance and travel time between two points
     * @param {Object} origin - User's location {latitude, longitude}
     * @param {Object} destination - Property location {latitude, longitude}
     * @returns {Object} Distance and time information
     */
    async calculateDistance(origin, destination) {
        try {
            if (!this.apiKey) {
                console.warn('Google Maps API key not found, using fallback calculation');
                return this.fallbackDistanceCalculation(origin, destination);
            }

            const origins = `${origin.latitude},${origin.longitude}`;
            const destinations = `${destination.latitude},${destination.longitude}`;

            const response = await axios.get(this.baseUrl, {
                params: {
                    origins,
                    destinations,
                    mode: 'driving',
                    units: 'metric',
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const drivingElement = response.data.rows[0].elements[0];

                // Get walking distance
                const walkingResponse = await axios.get(this.baseUrl, {
                    params: {
                        origins,
                        destinations,
                        mode: 'walking',
                        units: 'metric',
                        key: this.apiKey
                    }
                });

                let walkingElement = null;
                if (walkingResponse.data.status === 'OK' && walkingResponse.data.rows[0].elements[0].status === 'OK') {
                    walkingElement = walkingResponse.data.rows[0].elements[0];
                }

                return {
                    driving: {
                        distance: drivingElement.distance.text,
                        duration: drivingElement.duration.text,
                        distanceValue: drivingElement.distance.value, // meters
                        durationValue: drivingElement.duration.value // seconds
                    },
                    walking: walkingElement ? {
                        distance: walkingElement.distance.text,
                        duration: walkingElement.duration.text,
                        distanceValue: walkingElement.distance.value, // meters
                        durationValue: walkingElement.duration.value // seconds
                    } : null
                };
            }

            throw new Error('Failed to calculate distance from Google Maps API');
        } catch (error) {
            console.error('Distance calculation error:', error.message);
            return this.fallbackDistanceCalculation(origin, destination);
        }
    }

    /**
     * Fallback distance calculation using Haversine formula
     * @param {Object} origin - User's location {latitude, longitude}
     * @param {Object} destination - Property location {latitude, longitude}
     * @returns {Object} Approximate distance and time
     */
    fallbackDistanceCalculation(origin, destination) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(destination.latitude - origin.latitude);
        const dLon = this.toRadians(destination.longitude - origin.longitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(origin.latitude)) * Math.cos(this.toRadians(destination.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;
        const distanceMiles = distanceKm * 0.621371;

        // Estimate travel times
        const drivingTimeMinutes = Math.round(distanceKm * 2); // Rough estimate: 2 min per km
        const walkingTimeMinutes = Math.round(distanceKm * 12); // Rough estimate: 12 min per km

        return {
            driving: {
                distance: `${distanceKm.toFixed(1)} km`,
                duration: `${drivingTimeMinutes} mins`,
                distanceValue: distanceKm * 1000, // Convert to meters
                durationValue: drivingTimeMinutes * 60 // Convert to seconds
            },
            walking: {
                distance: `${distanceKm.toFixed(1)} km`,
                duration: `${walkingTimeMinutes} mins`,
                distanceValue: distanceKm * 1000, // Convert to meters
                durationValue: walkingTimeMinutes * 60 // Convert to seconds
            }
        };
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees
     * @returns {number} radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Calculate distance for multiple properties
     * @param {Object} userLocation - User's location {latitude, longitude}
     * @param {Array} properties - Array of property objects with coordinates
     * @returns {Array} Properties with distance information
     */
    async calculateDistancesForProperties(userLocation, properties) {
        if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
            return properties.map(property => ({
                ...property,
                distance: null
            }));
        }

        const propertiesWithDistance = await Promise.all(
            properties.map(async (property) => {
                if (!property.coordinates || !property.coordinates.latitude || !property.coordinates.longitude) {
                    return {
                        ...property,
                        distance: null
                    };
                }

                const distance = await this.calculateDistance(userLocation, property.coordinates);
                return {
                    ...property,
                    distance
                };
            })
        );

        return propertiesWithDistance;
    }
}

export default new DistanceService();
