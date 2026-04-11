// pages/admin/AdminRouteManagement.jsx
import { useState } from "react";
import LoadingVehicle from "../../components/LoadingVehicle";
import { FaRoute } from "react-icons/fa";
import RouteForm from "../../components/Schedule & Routing/RouteForm";
import TransportIcon from "../../components/Schedule & Routing/TransportIcon";
import PageHeader from "../../components/PageHeader";
import CardGrid from "../../components/Schedule & Routing/CardGrid";
import ConfirmDialog from "../../components/Schedule & Routing/ConfirmDialog";
import useCrud from "../../hooks/useCard";

const AdminRouteManagement = () => {
    const { data: routes, loading, fetchData, createItem, updateItem, deleteItem } = useCrud("/routes");
    const [showForm, setShowForm] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleCreateRoute = async (routeData) => {
        try {
            await createItem(routeData);
            setShowForm(false);
        } catch (error) {
            console.error("Error creating route:", error);
            alert(error.response?.data?.error || "Failed to create route");
        }
    };

    const handleUpdateRoute = async (id, routeData) => {
        try {
            await updateItem(id, routeData);
            setEditingRoute(null);
        } catch (error) {
            console.error("Error updating route:", error);
            alert(error.response?.data?.error || "Failed to update route");
        }
    };

    const handleDeleteRoute = async (id) => {
        try {
            await deleteItem(id);
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting route:", error);
            alert(error.response?.data?.error || "Failed to delete route");
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.routeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderRouteCard = (route, { onEdit, onDelete }) => (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <TransportIcon type={route.transportType} />
                        <span className="text-xs font-semibold text-gray-500">{route.transportType}</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onEdit(route)} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            ✏️ Edit
                        </button>
                        <button 
                            onClick={() => onDelete(route)} 
                            className="text-red-600 hover:text-red-800 transition-colors"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{route.name}</h3>
                <p className="text-sm text-gray-600 mb-2">#{route.routeNumber}</p>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Start → End:</span>
                        <span className="font-medium">
                            {route.startLocation?.name} → {route.endLocation?.name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Distance:</span>
                        <span className="font-medium">{route.distance || 'N/A'} km</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                            {route.estimatedDuration ? 
                                `${Math.floor(route.estimatedDuration / 60)}h ${route.estimatedDuration % 60}m` : 
                                'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Fare:</span>
                        <span className="font-medium text-green-600">Rs. {route.estimatedFare || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Stops:</span>
                        <span className="font-medium">{route.stops?.length || 0}</span>
                    </div>
                </div>

                {route.busNumber && (
                    <div className="mt-3 pt-3 border-t text-sm">
                        <span className="text-gray-500">Bus Number:</span>
                        <span className="ml-2 font-medium">{route.busNumber}</span>
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) return <LoadingVehicle message="Loading Routes..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Route Management"
                description="Create, edit, and manage all transportation routes"
                buttonText="Add New Route"
                onButtonClick={() => setShowForm(true)}
            />

            <CardGrid
                items={filteredRoutes}
                renderCard={renderRouteCard}
                onEdit={(route) => setEditingRoute(route)}
                onDelete={(route) => setDeleteConfirm(route)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search by route name or number..."
                emptyMessage="No routes found"
                emptyIcon={FaRoute}
            />

            {(showForm || editingRoute) && (
                <RouteForm
                    initialData={editingRoute}
                    onSubmit={editingRoute ? 
                        (data) => handleUpdateRoute(editingRoute._id, data) : 
                        handleCreateRoute
                    }
                    onCancel={() => {
                        setShowForm(false);
                        setEditingRoute(null);
                    }}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDeleteRoute(deleteConfirm._id)}
                title="Delete Route"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete Route"
                type="danger"
            />
        </div>
    );
};

export default AdminRouteManagement;