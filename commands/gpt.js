const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// API Gemini 2.0 Flash — À sécuriser via .env en production
const GEMINI_API_KEY = 'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  name: 'Ai',
  description: 'Interagit avec Google Gemini pour des réponses textuelles.',
  usage: 'Ai <votre question>',
  author: 'Raniel',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      await sendMessage(senderId, {
        text: "Utilisation : Ai <votre question>"
      }, pageAccessToken);
      return;
    }

    try {
      const payload = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      const response = await axios.post(GEMINI_API_URL, payload);

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune réponse générée.";

      await sendMessage(senderId, { text: result }, pageAccessToken);
    } catch (err) {
      console.error('Erreur Gemini :', err.message);
      await sendMessage(senderId, {
        text: "Une erreur est survenue lors de la génération de la réponse."
      }, pageAccessToken);
    }
  }
};
