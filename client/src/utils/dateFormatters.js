// utils/dateFormatters.js
import { format } from "date-fns";

export const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "hh:mm a");
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
};

export const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};