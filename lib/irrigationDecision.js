const SOIL_DATABASE = {
    "Sandy Soil":      { fieldCapacity: 0.20, wiltingPoint: 0.07 },
    "Sandy Loam":      { fieldCapacity: 0.33, wiltingPoint: 0.13 },
    "Loam":            { fieldCapacity: 0.35, wiltingPoint: 0.17 },
    "Clay Loam":       { fieldCapacity: 0.40, wiltingPoint: 0.23 },
    "Custom":          { fieldCapacity: 0.25, wiltingPoint: 0.12 }
  };
// no extra command to export this is bettre 
export const PLANT_DATABASE = {
    "Salix Integra":        { rootDepth: 400, mad: 0.5 },
    "Lawn Grass":           { rootDepth: 150, mad: 0.4 },
    "Maize":                { rootDepth: 600, mad: 0.5 },
    "Tomato":               { rootDepth: 600, mad: 0.4 },
    "Custom":               { rootDepth: 300, mad: 0.5 },
  };
  
  
  export function getIrrigationDecision({ soilType, rootDepth, mad, etData, rainData }) {
    const { fieldCapacity, wiltingPoint } = SOIL_DATABASE[soilType] || SOIL_DATABASE["Custom"];
    const allowedDepletion = (fieldCapacity - wiltingPoint) * rootDepth * mad;
  
    let lastRainIndex = -1;
    for (let i = rainData.length - 1; i >= 0; i--) {
      if ((rainData[i] || 0) > 2) {
        lastRainIndex = i;
        break;
      }
    }
  
    
    const currentDepletion =
      lastRainIndex === -1
        ? etData[etData.length - 1] || 0
        : (etData[etData.length - 1] || 0) - (etData[lastRainIndex] || 0);
  
    const decision =
      currentDepletion >= allowedDepletion
        ? "Irrigation recommended"
        : "No irrigation needed";
  
    return {
      decision,
      threshold: allowedDepletion.toFixed(1),
      currentDepletion: currentDepletion.toFixed(1),
    };
  }
  
  // export the soil database for use in forms
  export { SOIL_DATABASE };