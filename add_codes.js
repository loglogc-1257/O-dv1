const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const codesToAdd = [
  { date: '2025-09-17', code: '876543' },
  { date: '2025-09-18', code: '998877' },
  { date: '2025-09-19', code: '111333' },
  // ... ajoutez tous vos codes pour les 60 jours ici
];

async function insertCodes() {
  try {
    await client.connect();
    console.log('Connecté à la base de données pour insérer les codes.');

    for (const entry of codesToAdd) {
      const query = 'INSERT INTO daily_codes (date, code) VALUES ($1, $2) ON CONFLICT (date) DO NOTHING;';
      await client.query(query, [entry.date, entry.code]);
      console.log(`Code ${entry.code} ajouté pour la date ${entry.date}.`);
    }

    console.log('Tous les codes ont été insérés avec succès.');

  } catch (err) {
    console.error('Erreur lors de l\'insertion des codes:', err);
  } finally {
    await client.end();
  }
}

insertCodes();
