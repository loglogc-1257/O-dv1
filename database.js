const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL !'))
  .catch(err => console.error('Erreur de connexion à la base de données:', err));

async function manageUserAccess(senderId, name) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const userQuery = 'SELECT * FROM users WHERE user_id = $1';
    const result = await client.query(userQuery, [senderId]);
    let dailyQuestions;

    if (result.rows.length === 0) {
      // Cas d'un nouvel utilisateur
      const insertQuery = 'INSERT INTO users (user_id, name, daily_questions, last_access_date) VALUES ($1, $2, $3, $4)';
      await client.query(insertQuery, [senderId, name, 1, today]);
      dailyQuestions = 1;
    } else {
      const user = result.rows[0];

      // Vérifier si l'utilisateur a un accès illimité AVANT de faire quoi que ce soit
      if (user.daily_questions === -1) {
        return { allowed: true, count: -1 };
      }

      const updateQuery = 'UPDATE users SET name = $1, last_access_date = $2, daily_questions = $3 WHERE user_id = $4';

      if (user.last_access_date.toISOString().slice(0, 10) !== today) {
        // Nouvelle journée, on réinitialise le compteur
        await client.query(updateQuery, [name, today, 1, senderId]);
        dailyQuestions = 1;
      } else {
        // Même journée, on incrémente le compteur
        const newDailyQuestions = user.daily_questions + 1;
        await client.query(updateQuery, [name, today, newDailyQuestions, senderId]);
        dailyQuestions = newDailyQuestions;
      }
    }

    // Le reste de la logique reste la même
    return { allowed: dailyQuestions <= 6, count: dailyQuestions };
  } catch (err) {
    console.error('Erreur lors de la gestion de l\'accès utilisateur:', err);
    return { allowed: false, count: -1 };
  }
}

async function findUserById(userId) {
    try {
        const query = 'SELECT user_id FROM users WHERE user_id = $1';
        const result = await client.query(query, [userId]);
        return result.rows.length > 0;
    } catch (err) {
        console.error("Erreur lors de la recherche d'un utilisateur par ID:", err);
        return false;
    }
}

async function createReferral(referrerId, referredId) {
    try {
        const existingReferralQuery = 'SELECT * FROM referrals WHERE referred_id = $1';
        const existingReferralResult = await client.query(existingReferralQuery, [referredId]);
        
        if (existingReferralResult.rows.length > 0) {
            return false;
        }

        const query = 'INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)';
        await client.query(query, [referrerId, referredId]);
        return true;
    } catch (err) {
        console.error("Erreur lors de la création du parrainage:", err);
        return false;
    }
}


async function getConversationHistory(senderId) {
  try {
    const query = 'SELECT role, text FROM conversations WHERE user_id = $1 ORDER BY timestamp ASC LIMIT 10';
    const result = await client.query(query, [senderId]);
    return result.rows;
  } catch (err) {
    console.error("Erreur lors de la récupération de l'historique de conversation:", err);
    return [];
  }
}

async function addMessageToHistory(senderId, role, text) {
  try {
    const query = 'INSERT INTO conversations (user_id, role, text, timestamp) VALUES ($1, $2, $3, NOW())';
    await client.query(query, [senderId, role, text]);
  } catch (err) {
    console.error("Erreur lors de l'ajout d'un message à l'historique:", err);
  }
}

async function validateDailyCode(code) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const query = 'SELECT code FROM daily_codes WHERE date = $1';
    const result = await client.query(query, [today]);
    if (result.rows.length > 0 && result.rows[0].code === code) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Erreur lors de la validation du code:", err);
    return false;
  }
}

async function giveUnlimitedAccess(senderId) {
  try {
    const query = 'UPDATE users SET daily_questions = -1 WHERE user_id = $1';
    await client.query(query, [senderId]);
    return true;
  } catch (err) {
    console.error("Erreur lors de l'activation de l'accès illimité:", err);
    return false;
  }
}

module.exports = {
  manageUserAccess,
  getConversationHistory,
  addMessageToHistory,
  validateDailyCode,
  giveUnlimitedAccess,
  findUserById,
  createReferral
};
