// kinda our soil reference table, from lecture slides 
const SOIL_DATABASE = {
    "Sandy Soil":      { fieldCapacity: 0.20, wiltingPoint: 0.07 },
    "Sandy Loam":      { fieldCapacity: 0.33, wiltingPoint: 0.13 },
    "Loam":            { fieldCapacity: 0.35, wiltingPoint: 0.17 },
    "Clay Loam":       { fieldCapacity: 0.40, wiltingPoint: 0.23 },
    "Custom":          { fieldCapacity: 0.25, wiltingPoint: 0.12 },
};

// plants and their default depth and stress tolerance (MAD)
export const PLANT_DATABASE = {
    "Salix Integra":   { rootDepth: 400, mad: 0.5 },
    "Lawn Grass":      { rootDepth: 150, mad: 0.4 },
    "Maize":           { rootDepth: 600, mad: 0.5 },
    "Tomato":          { rootDepth: 600, mad: 0.4 },
    "Custom":          { rootDepth: 300, mad: 0.5 },
};


/**
 * Returns a rough irrigation advice based on depletion & rain
 */
export function getIrrigationDecision({ soilType, rootDepth, mad, etData, rainData }) {
    const soil = SOIL_DATABASE[soilType] || SOIL_DATABASE["Custom"];
    const maxDepletion = (soil.fieldCapacity - soil.wiltingPoint) * rootDepth * mad;

    // go backwards to find the last "real" rain event
    let rainResetIndex = -1;
    for (let i = rainData.length - 1; i >= 0; i--) {
        if ((rainData[i] || 0) > 2) {
            rainResetIndex = i;
            break;
        }
    }

    // figure out how much water we lost since last rain (or overall if none)
    const lastIndex = etData.length - 1;
    const currentLoss = rainResetIndex === -1
        ? (etData[lastIndex] || 0)
        : (etData[lastIndex] || 0) - (etData[rainResetIndex] || 0);

    // compare depletion to threshold
    const action = currentLoss >= maxDepletion
        ? "Irrigation recommended"
        : "No irrigation needed";

    return {
        decision: action,
        threshold: maxDepletion.toFixed(1),
        currentDepletion: currentLoss.toFixed(1),
    };
}


// for dropdowns/forms, etc.
export { SOIL_DATABASE };
