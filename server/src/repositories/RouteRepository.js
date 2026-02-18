import RouteT from "../models/RouteT";

export class RouteRepository {

    //repository for create route
    async create(routeData) {
        return await RouteT.create(routeData);
    }

    //repository for Read specific route
    async findById(id) {
        return await RouteT.findById(id);
    }

    //repository for Read all route
    async findAll() {
        return await RouteT.find();
    }

    //repository for update
    async update(id, data) {
        return await RouteT.findByIdAndUpdate(id, data, { new: true })
    }

    //Repository for deletre
    async delete(id) {
        return await RouteT.findByIdAndDelete(id);
    }
}