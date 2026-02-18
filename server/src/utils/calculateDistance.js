import axios from "axios";
import { meterToKm, secondsToMinutes } from "./distanceConverter";

async function calculateDistance(start, end) {

    //call OSRM API for calculate distance
    const url = `https://router.project-osrm.org/route/v1/driving/` + `${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`;

    const response = await axios.get(url);

    const route = response.data.routes[0];

    return {
        distanceKM: meterToKm(route.distance),
        distanceTime: secondsToMinutes(route.duration)
    };
}

export default calculateDistance;