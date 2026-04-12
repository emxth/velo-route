export function meterToKm(meters) {
    return Number((meters / 1000).toFixed(2));
}

export function secondsToMinutes(second) {
    return Math.ceil(second / 60);
}