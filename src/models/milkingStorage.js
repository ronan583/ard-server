const { SENSOR_DATA_TABLE } = require("../constant.js");
const { Pool } = require("pg");
const debug = require("debug")("milking-storage:db");

const MILKING_DATA_DDL = `
  CREATE TABLE IF NOT EXISTS ${SENSOR_DATA_TABLE} (
    id SERIAL PRIMARY KEY,
    name TEXT,
    date DATE,
    time TIME,
    adc0 INT,
    adc1 INT,
    adc2 INT,
    adc3 INT,
    r_br INT,
    g_br INT,
    b_br INT,
    ir1_br INT,
    ir2_br INT,
    r_bl INT,
    g_bl INT,
    b_bl INT,
    ir1_bl INT,
    ir2_bl INT,
    r_fr INT,
    g_fr INT,
    b_fr INT,
    ir1_fr INT,
    ir2_fr INT,
    r_fl INT,
    g_fl INT,
    b_fl INT,
    ir1_fl INT,
    ir2_fl INT
  )
`;

const MILKING_DATA_INSERT = `
    INSERT INTO ${SENSOR_DATA_TABLE} (
      name, date, time, adc0, adc1, adc2, adc3,
      r_br, g_br, b_br, ir1_br, ir2_br,
      r_bl, g_bl, b_bl, ir1_bl, ir2_bl,
      r_fr, g_fr, b_fr, ir1_fr, ir2_fr,
      r_fl, g_fl, b_fl, ir1_fl, ir2_fl      
    ) VALUES ($1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27
    );
`;

class MilkingStorage {
  constructor() {
    const isHeroku =
      process.env.DATABASE_URL &&
      process.env.DATABASE_URL.startsWith("postgres://");
    // determine environment: disable SSL in local, enable in heroku cloud
    const sslConfig = isHeroku ? { ssl: { rejectUnauthorized: false } } : {};

    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:admin@localhost/sensor_db",
      ...sslConfig,
    });
  }

  async open() {
    const client = await this.pool.connect();
    try {
      await client.query(MILKING_DATA_DDL);
      console.log("Sensor data database initialized.");
    } catch (err) {
      debug(err);
    } finally {
      client.release();
    }
  }

  async insertData(data) {
    debug("Inserting sensor data", data);
    await this.pool.query(MILKING_DATA_INSERT, Object.values(data));
  }

  async getAllMilkingNames(startDate, endDate, order = "ASC") {
    let query = `SELECT DISTINCT name FROM ${SENSOR_DATA_TABLE} `;
    if (startDate && endDate) {
      query += `WHERE date BETWEEN '${startDate}' AND '${endDate}' `;
    }
    query += `ORDER BY name ${order}`;
    try {
      const result = await this.pool.query(query);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  async getAllRecordsByName(name) {
    const query = `SELECT date, time, adc0, adc1, adc2, adc3,
    r_br, g_br, b_br, ir1_br, ir2_br,
    r_bl, g_bl, b_bl, ir1_bl, ir2_bl,
    r_fr, g_fr, b_fr, ir1_fr, ir2_fr,
    r_fl, g_fl, b_fl, ir1_fl, ir2_fl FROM ${SENSOR_DATA_TABLE} WHERE name = $1 ORDER BY time ASC;`;
    const { rows } = await this.pool.query(query, [name]);
    return rows;
  }
}

const milkingStorage = new MilkingStorage();

(async function () {
  await milkingStorage.open();
})().catch((err) => {
  console.error("Unable to open database");
  console.error(err);
  process.exit();
});

module.exports = milkingStorage;
