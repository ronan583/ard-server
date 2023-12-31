const sensorCsvHeader = [
  { id: "date", title: "Date" },
  { id: "time", title: "Time" },
  { id: "adc0", title: "ADC1" },
  { id: "adc1", title: "ADC2" },
  { id: "adc2", title: "ADC3" },
  { id: "adc3", title: "ADC4" },
  { id: "r_br", title: "R-BR" },
  { id: "g_br", title: "G-BR" },
  { id: "b_br", title: "B-BR" },
  { id: "ir1_br", title: "I1-BR" },
  { id: "ir2_br", title: "I2-BR" },
  { id: "r_bl", title: "R-BL" },
  { id: "g_bl", title: "G-BL" },
  { id: "b_bl", title: "B-BL" },
  { id: "ir1_bl", title: "I1-BL" },
  { id: "ir2_bl", title: "I2-BL" },
  { id: "r_fr", title: "R-FR" },
  { id: "g_fr", title: "G-FR" },
  { id: "b_fr", title: "B-FR" },
  { id: "ir1_fr", title: "I1-FR" },
  { id: "ir2_fr", title: "I2-FR" },
  { id: "r_fl", title: "R-FL" },
  { id: "g_fl", title: "G-FL" },
  { id: "b_fl", title: "B-FL" },
  { id: "ir1_fl", title: "I1-FL" },
  { id: "ir2_fl", title: "I2-FL" },
  { id: "rg_br", title: "R/G-BR" },
  { id: "rg_bl", title: "R/G-BL" },
  { id: "rg_fr", title: "R/G-FR" },
  { id: "rg_fl", title: "R/G-FL" },
  { id: "msg", title: "Message" },
];

const statisticCsvHeader = [
  { id: "name", title: "Name" },
  { id: "startTime", title: "Start Time" },
  { id: "stopTime", title: "Stop Time" },
  { id: "type", title: "Type" },
  { id: "duration", title: "Duration" },
  { id: "avgRG", title: "Avg R&G" },
  { id: "maxRgBr", title: "Max R/G BR" },
  { id: "maxRgBl", title: "Max R/G BL" },
  { id: "maxRgFr", title: "Max R/G FR" },
  { id: "maxRgFl", title: "Max R/G FL" },
  { id: "minRgBr", title: "Min R/G BR" },
  { id: "minRgBl", title: "Min R/G BL" },
  { id: "minRgFr", title: "Min R/G FR" },
  { id: "minRgFl", title: "Min R/G FL" },
  { id: "avgRgBr", title: "Avg R/G BR" },
  { id: "avgRgBl", title: "Avg R/G BL" },
  { id: "avgRgFr", title: "Avg R/G FR" },
  { id: "avgRgFl", title: "Avg R/G FL" },
  { id: "sigmaRgBr", title: "Std R/G BR" },
  { id: "sigmaRgBl", title: "Std R/G BL" },
  { id: "sigmaRgFr", title: "Std R/G FR" },
  { id: "sigmaRgFl", title: "Std R/G FL" },
];

const EMPTY_VALUE = -1;
const BLOOD_THRESHOLD = 1.2; // could be 1.1
const AVG_RG_THRESHOLD = 800;
const DURATION_THRESHOLD = 20;

const SENSOR_DATA_TABLE = "sensor_data";

module.exports = {
  sensorCsvHeader,
  statisticCsvHeader,
  EMPTY_VALUE,
  AVG_RG_THRESHOLD,
  DURATION_THRESHOLD,
  BLOOD_THRESHOLD,
  SENSOR_DATA_TABLE,
};
