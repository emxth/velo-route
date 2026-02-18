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


}