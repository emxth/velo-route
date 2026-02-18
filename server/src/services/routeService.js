import { RouteRepository } from "../repositories/RouteRepository";
import calculateDistance from "../utils/calculateDistance";
import { logger } from "../utils/logger";

const repo = new RouteRepository();

export class RouterService {

    //distance calculate for Route
    async calculateRouteDistance(stops) {

        //declare a variable
        let totalDistance = 0;
        let totalTime = 0;

        for (let i = 0; i < stops.length - 1; i++) {

            //variable for catch destinations
            const start = stops[i];
            const end = stops[i + 1];

            const getmetrics = await calculateDistance(start, end);

            totalDistance += getmetrics.distanceKM;
            totalTime += getmetrics.distanceTime;



        }

        return {
            destinationKM: totalDistance,
            destinationTime: totalTime
        };

    }
    //route create Srvice
    async createRoute(routeData) {

        try {
            const { stops } = routeData;

            //check route has stops
            if (!stops || stops.length < 2) {
                logger.error("Route must contain at least 2 stops", { error: "not found" });
                throw new Error("Route must contain at least 2 stops");
            }

            let metrics = null;

            try {
                metrics = await this.calculateRouteDistance(stops);
                logger.info("Distance Calculated", {
                    routeName: routeData.name,
                    distance: metrics.destinationKM
                });
            } catch (err) {
                logger.warn("Distance Calculation Failed",
                    { error: err.message })
            }

            //prepare data for pass repository
            const routeDataForRepo = {
                routeData,
                distance: metrics.destinationKM,
                estimatedDuration: metrics.destinationTime
            }

            //pass data to repor
            const route = await repo.create(routeDataForRepo);
            logger.info("Route Create SuccessFully....");
            return route;

        } catch (err) {
            logger.error("Route Not Created");
            throw err;
        }
    }
}