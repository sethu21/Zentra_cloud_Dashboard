// grabs the next 16 days forecast using Open-Meteo's public API
export async function fetchLiveForecast(lat, lon) {
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,rain,wind_speed_10m,showers,snowfall,surface_pressure,evapotranspiration,et0_fao_evapotranspiration&forecast_days=16&timezone=auto`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) {
            console.warn("Live forecast error code:", response.status);
            throw new Error(`Forecast fetch failed with status ${response.status}`);
        }

        const result = await response.json();
        // console.log("Live forecast:", result); // disable when done testing
        return result;
    } catch (err) {
        console.error("Live weather fetch failed:", err.message);
        return null;
    }
}


// pulls archived hourly weather for a given date range
export async function fetchHistoricalForecast(lat, lon, start, end) {
    const historyUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&hourly=temperature_2m,relativehumidity_2m,rain,wind_speed_10m,showers,snowfall,surface_pressure,evapotranspiration,et0_fao_evapotranspiration&timezone=auto`;

    try {
        const res = await fetch(historyUrl);
        if (!res.ok) {
            console.warn("Historical weather API error:", res.status);
            throw new Error(`Archive fetch failed - status ${res.status}`);
        }

        const history = await res.json();
        // console.log("Historical weather data:", history);
        return history;
    } catch (err) {
        console.error("Couldn't load past weather:", err.message);
        return null;
    }
}
