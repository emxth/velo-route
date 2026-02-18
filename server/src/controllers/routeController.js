import { RouterService } from "../services/routeService";
import { logger } from "../utils/logger";

const service = new RouterService();

export class RouteController {

    //route creat controller
    async create(req, res) {
        try {
            const route = await service.createRoute(req.body);
            res.status(201).json(route);
        } catch (err) {
            logger.error(err.message);
            res.status(400).json({ error: err.message })
        }
    }

    //Read all routes 
    async getAll(req, res) {
        try {
            const routes = await service.getAllRoutes();
            res.status(201).json(routes);
        } catch (err) {
            logger.error(err.message);
            res.status(500).json({ error: `Server Error ${err.message}` })
        }
    }

    //read spesific route
    async getById(req, res) {
        try {
            const route = await service.getRouteByID(req.params.id);
            res.status(201).json(route);
        } catch (err) {
            logger.error(err.message);
            res.status(404).json({ error: `Server Error ${err.message}` });
        }
    }

    //request for update Route
    async update(req, res) {
        try {
            const route = await service.updateRoute(req.params.id, req.body);
            res.status(201).json(route);
        } catch (err) {
            logger.error(err.message);
            res.status(404).json({ error: err.message });
        }
    }

    //request for delete Route
    async delete(req, res) {
        try {
            const result = await service.deleteRoute(req.params.id);
            res.status(201).json(result);
        } catch (err) {
            logger.error(err.message);
            res.status(404).json({ error: err.message });
        }
    }


}