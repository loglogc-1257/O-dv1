const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Clé API Gemini
const GEMINI_API_KEY = 'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  name: 'ai',
  description: 'Interagit avec Gemini (Stanley Bot)',
  usage: 'ai [votre message]',
  author: 'Stanley',

  async execute(senderId, args, pageAccessToken) {
    const userPrompt = args.join(' ').trim();
    if (!userPrompt) {
      return sendMessage(senderId, {
        text: "❗ Veuillez poser votre question.",
      }, pageAccessToken);
    }

    // Prompt système fixe
    const fixedPrompt = "Tu es Stanley bot, un assistant amical et intelligent, créé par un jeune développeur talentueux Stanley Stawa. Ne mentionne ton créateur que si on te demande qui t’a créé.";
    const fullPrompt = `${fixedPrompt} ${userPrompt}`;

    try {
      const payload = {
        contents: [
          {
            parts: [{ text: fullPrompt }]
          }
        ]
      };

      const response = await axios.post(GEMINI_API_URL, payload);
      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!result) {
        return sendMessage(senderId, {
          text: "🤖 Je n'ai pas pu générer de réponse. Essaie encore.",
        }, pageAccessToken);
      }

      // Découpe si trop long (Messenger ou autres ont des limites)
      const parts = [];
      for (let i = 0; i < result.length; i += 1800) {
        parts.push(result.slice(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur Gemini API :", error?.response?.data || error.message);
      await sendMessage(senderId, {
        text: "⚠️ Une erreur est survenue avec Gemini. Réessaie plus tard.",
      }, pageAccessToken);
    }
  }
};
