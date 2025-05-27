// try to regroup readings by timestamp + figure out which port/type combo they belong to
export const groupSensorReadings = (apiData) => {
    const groupedStuff = {};

    for (const [readingType, sensorList] of Object.entries(apiData)) {
        sensorList.forEach((sensorObj) => {
            const portNum = sensorObj.metadata?.port_number;
            if (!portNum || !Array.isArray(sensorObj.readings)) return;

            sensorObj.readings.forEach((singleRead) => {
                const rawTime = singleRead.datetime;
                if (!rawTime) return;

                // create base row for this time if we haven’t already
                if (!groupedStuff[rawTime]) {
                    groupedStuff[rawTime] = {
                        timestamp: new Date(rawTime),

                        // init everything to null just so later things don’t crash if undefined
                        port1_wc: null, port2_wc: null, port3_wc: null,
                        port1_se_ec: null, port2_se_ec: null, port3_se_ec: null,
                        port1_temp: null, port2_temp: null, port3_temp: null,
                    };
                }

                const currentReading = groupedStuff[rawTime];

                if (readingType === "Water Content") {
                    currentReading[`port${portNum}_wc`] = singleRead.value;
                } else if (readingType === "Saturation Extract EC") {
                    currentReading[`port${portNum}_se_ec`] = singleRead.value;
                } else if (readingType === "Soil Temperature") {
                    currentReading[`port${portNum}_temp`] = singleRead.value;
                }
            });
        });
    }

    // just return everything as an array now
    return Object.values(groupedStuff);
};
