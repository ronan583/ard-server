# Milking Data Web Service

## Version and Remote Repository

- **Version**: 1.0.1

- **GitHub**: [ard-server](https://github.com/ronan583/ard-server)

## Application Architecture

![Architecture](readme_images/architecture.png)

## Requirements

- Node.js: v16.20.2 (npm 8.19.4)
- PostgreSQL: 15

## File Structure

```bash
.
├── node_modules
├── src
│   ├── controllers
│   │   ├── controllers.js
│   │   └── wssHandler.js
│   ├── models
│   │   └── milkingStorage.js
│   ├── routes
│   │   └── routes.js
│   ├── utils
│   ├── calculation.js
│   └── timeAndDate.js
├── app.js
├── constant.js
├── .gitignore
└── package.json

```

## URLs

- Local HTTP: `http://localhost:8080`
- Local WebSocket: `http://{internal_ip_address}:8765` (Ensure the Arduino and server are connected within the same network.)

## How to Start

In root directory, 

```javascript
npm run start
```

or

```javascript
npm run dev
```

to start the server.

Open the `milking-data.html` file to use the service.

## Main Features and Flow Charts

- Receive and process websocket message from Arduino device.

![loggingdata](readme_images/loggingdata.png)

- Retrieve all milking records for a date range, display them in the interface's calendar.

![allmilking](readme_images/allmilking.png)

- Download a singular milking record in CSV file.

![getsensordata](readme_images/getsensordata.png)

- Download statistical data of milking records over a designated date range.

![getstatistics](readme_images/getstatistics.png)

## Data Storage

### Local Database Configuration

- PostgreSQL Username: `postgres`
- PostgreSQL Password: `admin`
- Database Name: `sensor_db`
- Table Name: `sensor_data`
- Port: `5432`

### Remote Data Workflow

- Heroku Dashboard's Dataclips:

You can access Dataclips by navigating to your Heroku Dashboard, selecting your application, and then choosing the 'Dataclips' option.

The interface allows you to write SQL queries, execute them, and view the results directly within the web browser.

- Heroku CLI:

The Heroku CLI offers a command-line tools to interact with the Heroku apps and data.

To use the Heroku CLI, you need to install it on your local machine. Once installed, you can use various commands to interact with your Heroku applications and databases.

Common commands include `heroku pg:psql` for direct database access and `heroku logs` for viewing application logs.

## API Examples

### `GET /api/names`

Retrieves milking record names for a specified date range.

#### Query Parameters

- `startDate` (optional): The start date for the records.
- `endDate` (optional): The end date for the records.

#### Example Request

```javascript
GET /api/names?startDate=2023-12-10&endDate=2023-12-14
```

> **Note:** The startDate and endDate field's format is YYYY-MM-DD, with padding '0' when 1 digit.

#### Response Format

Content-Type: application/json

```json
[
  {
    "name": "10_12_2023_7_36"
  },
  {
    "name": "10_12_2023_7_45"
  }
]
```

> **Note:** The name field's format is D_M_YYYY_H_M, without padding '0'.

### `GET /api/csv/:name`

Retrieves a CSV file with the specified name.

#### Example Request

```javascript
GET / api / csv / 2_12_2023_10_32;
```

> **Note:** The name field's format is D_M_YYYY_H_M, without padding '0'.

### `GET /api/statistic`

Retrieves statistical data for a specified date range.

#### Query Parameters:

- `startDate` (optional): The start date for the statistics.

- `endDate` (optional): The end date for the statistics.

#### Example Request

```javascript
GET /api/statistic/?startDate=2023-12-10&endDate=2023-12-14
```

> **Note:** The startDate and endDate field's format is YYYY-MM-DD, with padding '0' when 1 digit.

## CSV Format

### Milking sensor data file

#### Filename:

`sensor_data_dd_mm_yyyy_hh_mm.csv`

#### File header:

```javascript
[
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
```

### Batch milking metrics file

#### Filename:

`batches_statistics_yyyy-mm-dd_yyyy-mm-dd.csv`

#### File header:

```javascript
[
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
```

## Heroku Remote VPS (Dyno)

- VPS plan and add-on: 
  - `Eco Dyno` (Small personal plan, $5/month)
  - `Heroku Postgres Basic` (Max of $9/month)
- URL: `ard-server-2374411dd7c6.herokuapp.com`
- For HTTP: `http://ard-server-2374411dd7c6.herokuapp.com`
- For WebSocket:
  - Server IP: `ard-server-2374411dd7c6.herokuapp.com`
  - Port: `80`
- Environment Variables
  - `DATABASE_URL`: `postgres://wbztuzvgaebkrc:81d058f713f9183bd08dd141a8d4a3a8976e7a66ba36bebdeabbd6d33118f834@ec2-107-21-67-46.compute-1.amazonaws.com:5432/db4ft36dnl13g0`
  - `TZ`: `Pacific/Auckland`
