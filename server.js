import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getAllStats, getComparisonStats, getMostRecentStats } from './db.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Homepage (dashboard)
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, './views/index.html'));
});

// JSON API endpoint to get all the stats in the database
app.get('/api/getAllStats', async function (request, response) {
  const rows = await getAllStats();
  response.send(JSON.stringify(rows));
});

// JSON API endpoint to get most recent stats in the database
app.get('/api/getMostRecentStats', async function (request, response) {
  const rows = await getMostRecentStats();
  response.send(JSON.stringify(rows));
});

// JSON API endpoint to get 2nd most recent stats in the database for comparison
app.get('/api/getComparisonStats', async function (request, response) {
  const rows = await getComparisonStats();
  response.send(JSON.stringify(rows));
});

const listener = app.listen(process.env.PORT || '8000', () => {
  console.log('App listening on port ' + listener.address().port);
});
