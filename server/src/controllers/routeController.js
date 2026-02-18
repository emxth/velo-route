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

    async getById(req, res) {
        try {
            const route = await service.getRouteByID(req.params.id);
            res.status(201).json(route);
        } catch (err) {
            logger.error(err.message);
            res.status(500).json({ error: `Server Error ${err.message}` });
        }
    }


}