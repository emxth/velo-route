import { useState, useCallback, useEffect } from "react";
import api from "../api/axios";

const useCrud = (endpoint, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(endpoint);
            setData(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createItem = useCallback(async (itemData) => {
        try {
            const response = await api.post(endpoint, itemData);
            await fetchData();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        }
    }, [endpoint, fetchData]);

    const updateItem = useCallback(async (id, itemData) => {
        try {
            const response = await api.put(`${endpoint}/${id}`, itemData);
            await fetchData();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        }
    }, [endpoint, fetchData]);

    const deleteItem = useCallback(async (id) => {
        try {
            const response = await api.delete(`${endpoint}/${id}`);
            await fetchData();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            throw err;
        }
    }, [endpoint, fetchData]);

    return {
        data,
        loading,
        error,
        fetchData,
        createItem,
        updateItem,
        deleteItem
    };
};

export default useCrud;