
export async function fetchLiveForecast(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,rain,wind_speed_10m,showers,snowfall,surface_pressure,evapotranspiration,et0_fao_evapotranspiration&forecast_days=16&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Live forecast HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Live forecast data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching live forecast:", error);
    return null;
  }
}

// Fetch historical data for a given date range
export async function fetchHistoricalForecast(latitude, longitude, startDate, endDate) {
  // Use the arhcive endpoint and passes the start_dates and end_date in to parameters.
  // The dates must be in YYYY-MM-DD format.
  // but still having issues i dont have idea 
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,relativehumidity_2m,rain,wind_speed_10m,showers,snowfall,surface_pressure,evapotranspiration,et0_fao_evapotranspiration&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Historical data HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Historical forecast data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching historical forecast:", error);
    return null;
  }
}
