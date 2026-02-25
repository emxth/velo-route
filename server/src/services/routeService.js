
import { RouteRepository } from "../repositories/RouteRepository.js";
import calculateDistance from "../utils/calculateDistance.js";
import { logger } from "../utils/logger.js";

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
        console.log("getmertic" + totalDistance);

        return {
            destinationKM: Number(totalDistance),
            destinationTime: Number(totalTime)
        };

    }

    //route create Srvice
    async createRoute(routeData) {

        try {

            const data = { ...routeData };
            //const { stops } = routeData;

            //check route has stops
            if (!data.stops || data.stops.length < 2) {
                logger.error("Route must contain at least 2 stops", { error: "not found" });
                throw new Error("Route must contain at least 2 stops");
            }

            let metrics = null;

            try {
                metrics = await this.calculateRouteDistance(data.stops);

                console.log(metrics);
                logger.info("Distance Calculated", {
                    routeName: routeData.name,
                    distance: metrics?.destinationKM
                });
            } catch (err) {
                logger.warn("Distance Calculation Failed",
                    { error: err.message })
            }


            const distance = Number(metrics?.destinationKM) || 0;
            const estimatedDuration = Number(metrics?.destinationTime) || 0;
            const estimatedFare = Number(data.stops[data.stops.length - 1].fareFromPrevious);

            //prepare data for pass repository
            const routeDataForRepo = {
                ...routeData,
                distance: distance,
                estimatedDuration: estimatedDuration,
                estimatedFare: estimatedFare
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

    //Read all routes
    async getAllRoutes() {
        return await repo.findAll();
    }

    //read specific routes with 
    async getRouteByID(id) {

        const route = await repo.findById(id);
        if (!route) throw new Error("Route not Found");

        return await this.enrichStops(route);
    }

    //update exist routes
    async updateRoute(id, data) {

        //check and get existing data
        const existRoute = await repo.findById(id);

        if (!existRoute) throw new Error("Route Not Found");

        let distance = existRoute.distance;
        let estimatedDuration = existRoute.estimatedDuration;


        //if user update stops calculate again
        if (data.stops) {
            if (data.stops.length < 2) {
                throw new Error("Route must contain at least 2 stops");
            }

            try {
                const matris = await this.calculateRouteDistance(data.stops);

                distance = Number(matris?.destinationKM) || 0;
                estimatedDuration = Number(matris?.destinationTime) || 0;

                logger.info("Route distance and estimated time recalculated...", {
                    routeId: id,
                    distance,
                    estimatedDuration
                });
            } catch (err) {
                logger.warn("Recalculation Failed...", {
                    error: err.message
                })
            }
        }

        const finalData = {
            ...data,
            distance,
            estimatedDuration
        }

        //update data
        const route = await repo.update(id, finalData);

        if (!route) throw new Error("Route Not Found");

        return route;
    }

    //delete routes
    async deleteRoute(id) {
        const route = await repo.delete(id);
        if (!route) throw new Error("Route not Found");
        return {
            message: "Route deleted Successfully"
        };
    }


    //stops with segment distance/duration
    async enrichStops(route) {

        //get and store retrieved route
        const stops = route.stops;
        const enrichedStop = [];

        for (let i = 0; i < stops.length - 1; i++) {

            let segmentDistance = 0, segmentTime = 0;

            if (1 > 0) {
                const from = stops[i];
                const to = stops[i + 1];

                try {
                    const getMaterics = calculateDistance(from, to);
                    segmentDistance = getMaterics.distanceKM;
                    segmentTime = await getMaterics.distanceTime;
                } catch (err) {
                    logger.error(`Distances not Found ${err}`);
                }
            }

            enrichedStop.push({
                ...stops[i]._doc,
                segmentDistance,
                segmentTime
            });
        }
        return {
            ...route._doc,
            stops: enrichedStop
        };


    }
}