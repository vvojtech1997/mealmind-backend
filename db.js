const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_FILE = path.join(__dirname, 'mealmind.db');
const db = new sqlite3.Database(DB_FILE);

function initDb(){
  db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT, source_url TEXT, name TEXT, time INTEGER, estimatedCost REAL,
      servings INTEGER, tags TEXT, goals TEXT, mealType TEXT, ingredients TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS scrape_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE, source TEXT, status TEXT DEFAULT 'pending', last_error TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, name TEXT, allergies TEXT, is_premium INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
  console.log('DB initialized at', DB_FILE);
}

module.exports = { db, initDb };
