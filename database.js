const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Se connecte une seule fois au démarrage
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL !'))
  .catch(err => console.error('Erreur de connexion à la base de données:', err));

async function manageUserAccess(senderId) {
  const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

  try {
    const userQuery = 'SELECT * FROM users WHERE user_id = $1';
    const result = await client.query(userQuery, [senderId]);

    let dailyQuestions;

    if (result.rows.length === 0) {
      // Nouvel utilisateur
      const insertQuery = 'INSERT INTO users (user_id, daily_questions, last_access_date) VALUES ($1, $2, $3)';
      await client.query(insertQuery, [senderId, 1, today]);
      dailyQuestions = 1;
    } else {
      // Utilisateur existant
      const user = result.rows[0];
      if (user.last_access_date.toISOString().slice(0, 10) !== today) {
        // Nouvelle journée, réinitialiser le compteur
        const updateQuery = 'UPDATE users SET daily_questions = $1, last_access_date = $2 WHERE user_id = $3';
        await client.query(updateQuery, [1, today, senderId]);
        dailyQuestions = 1;
      } else {
        // Même journée, incrémenter le compteur
        const updateQuery = 'UPDATE users SET daily_questions = daily_questions + 1 WHERE user_id = $1';
        await client.query(updateQuery, [senderId]);
        dailyQuestions = user.daily_questions + 1;
      }
    }

    return { allowed: dailyQuestions <= 6, count: dailyQuestions };

  } catch (err) {
    console.error('Erreur lors de la gestion de l\'accès utilisateur:', err);
    return { allowed: false, count: -1 }; // En cas d'erreur, ne pas autoriser
  }
}

module.exports = {
  manageUserAccess
};
