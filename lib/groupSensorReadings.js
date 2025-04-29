// Organizes readings by timestamp and sensor type
export const groupSensorReadings = (apiData) => {
    const result = {};
  
    for (const [type, sensors] of Object.entries(apiData)) {
      sensors.forEach((sensor) => {
        const port = sensor.metadata?.port_number;
        if (!port || !Array.isArray(sensor.readings)) return;
  
        sensor.readings.forEach((reading) => {
          const ts = reading.datetime;
          if (!ts) return;
  
          if (!result[ts]) {
            result[ts] = {
              timestamp: new Date(ts),
              port1_wc: null, port2_wc: null, port3_wc: null,
              port1_se_ec: null, port2_se_ec: null, port3_se_ec: null,
              port1_temp: null, port2_temp: null, port3_temp: null,
            };
          }
  
          if (type === "Water Content") {
            result[ts][`port${port}_wc`] = reading.value;
          } else if (type === "Saturation Extract EC") {
            result[ts][`port${port}_se_ec`] = reading.value;
          } else if (type === "Soil Temperature") {
            result[ts][`port${port}_temp`] = reading.value;
          }
        });
      });
    }
  
    return Object.values(result);
  };