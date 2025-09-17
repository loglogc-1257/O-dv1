const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    await client.connect();
    console.log('Connecté à la base de données PostgreSQL pour la création des tables.');

    // Commande SQL pour la table 'users'
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(255) PRIMARY KEY,
        daily_questions INT DEFAULT 0,
        last_access_date DATE
      );
    `;

    // Commande SQL pour la table 'conversations'
    const createConversationsTableQuery = `
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(user_id),
        role VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `;

    // Commande SQL pour la table 'daily_codes'
    const createDailyCodesTableQuery = `
      CREATE TABLE IF NOT EXISTS daily_codes (
        date DATE PRIMARY KEY,
        code VARCHAR(6) NOT NULL
      );
    `;

    console.log('Création de la table "users"...');
    await client.query(createUsersTableQuery);
    console.log('Table "users" créée avec succès.');

    console.log('Création de la table "conversations"...');
    await client.query(createConversationsTableQuery);
    console.log('Table "conversations" créée avec succès.');
    
    console.log('Création de la table "daily_codes"...');
    await client.query(createDailyCodesTableQuery);
    console.log('Table "daily_codes" créée avec succès.');

  } catch (err) {
    console.error('Erreur lors de la création des tables:', err);
  } finally {
    await client.end();
  }
}

createTables();
