import sqlite3 from 'sqlite3';
import fs from 'fs';

const RECREATE_DB = false; // switch to true when DB needs to be recreated during dev
const dbFile = './data/sqlite.db';
const dbTable = 'StatsValues';

const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbFile);

export function initDatabase() {
  // if db file does not exist, or if RECREATE_DB, then create it
  db.serialize(() => {
    if (!fs.existsSync(dbFile) || RECREATE_DB) {
      console.log(`Dropping and recreating ${dbTable} table`);
      db.run(`DROP TABLE IF EXISTS ${dbTable}`);
      db.run(`CREATE TABLE ${dbTable} (
               timestamp INTEGER,
               key TEXT,
               value REAL)`);
      console.log(`New table ${dbTable} created!`);
    } else {
      console.log(`Database already exists, ready to go!`);
    }
    getAllStats().then((row) => {
      if (row) {
        console.log('record:', row);
      }
    });
  });
}

export function getAllStats() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * from ${dbTable}`, (err, rows) => {
      if (err) {
        console.error('Error getting all stats', err);
        reject(err);
      }
      resolve(rows);
    });
  });
}

export function getMostRecentStats() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * from ${dbTable} sv1 WHERE
      timestamp = (SELECT MAX(timestamp) FROM ${dbTable} sv2 WHERE sv1.key = sv2.key)`,
      function (err, rows) {
        if (err) {
          console.error('Error getting most recent stats', err);
          reject(err);
        }
        resolve(rows);
      },
    );
  });
}

export function getComparisonStats() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * from ${dbTable} sv1 WHERE
      timestamp = (SELECT MAX(timestamp) 
      FROM ${dbTable} sv2 WHERE sv1.key = sv2.key 
      AND timestamp NOT IN (SELECT MAX(timestamp) FROM ${dbTable} sv3 WHERE sv1.key = sv3.key))`,
      function (err, rows) {
        if (err) {
          console.error('Error getting most recent stats', err);
          reject(err);
        }
        resolve(rows);
      },
    );
  });
}

export function updateStat(statKey, statValue) {
  return new Promise(function (resolve, reject) {
    db.serialize(function () {
      const insertStmt = db.prepare(
        `INSERT INTO ${dbTable} (timestamp, key, value) VALUES (datetime('now'), ?, ?)`,
      );
      insertStmt.run(statKey, statValue);

      /**
       * Now delete any other values for this stat within the same day.
       * Because comparisons with less than 1 day ago don't make sense.
       * And this allows us to potentially override mistakes without them
       * being kept around to show the difference.
       */
      const deleteStmt = db.prepare(`DELETE from ${dbTable} WHERE key = ?
        AND timestamp > date('now','-1 day')
        AND timestamp NOT IN (SELECT MAX(timestamp) FROM ${dbTable} sv2 WHERE key = sv2.key)`);

      deleteStmt.run(statKey, function (err, rows) {
        if (err) {
          console.error('Error deleting stats values from same day', err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  });
}
