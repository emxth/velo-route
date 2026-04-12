// api/locationService.js
import axios from "axios";

class LocationService {
    constructor() {
        this.baseUrl = "https://nominatim.openstreetmap.org";
        this.cache = new Map();
    }

    async getCoordinates(address, country = "Sri Lanka") {
        if (!address || address.trim() === "") {
            throw new Error("Please enter a location name");
        }

        // Check cache
        const cacheKey = `${address}_${country}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const searchQuery = `${address}, ${country}`;

            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'TransportManagementSystem/1.0',
                    'From': 'admin@transport.com'
                },
                timeout: 10000 // 10 second timeout
            });

            if (response.data && response.data.length > 0) {
                const result = {
                    lat: parseFloat(response.data[0].lat),
                    lng: parseFloat(response.data[0].lon),
                    displayName: response.data[0].display_name
                };

                // Cache the result
                this.cache.set(cacheKey, result);
                setTimeout(() => this.cache.delete(cacheKey), 24 * 60 * 60 * 1000); // Clear after 24 hours

                return result;
            }
            throw new Error(`Location "${address}" not found. Please check spelling or enter coordinates manually.`);
        } catch (error) {
            console.error("Geocoding error:", error);
            if (error.code === 'ECONNABORTED') {
                throw new Error("Request timeout. Please try again.");
            }
            throw new Error("Failed to get coordinates. Please enter manually or check your internet connection.");
        }
    }

    isValidCoordinates(lat, lng) {
        return lat && lng && !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }
}

export default new LocationService();