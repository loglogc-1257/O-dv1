const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with Gemini AI',
  usage: 'ai [votre message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const userPrompt = args.join(' ');
    if (!userPrompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question."
      }, pageAccessToken);
    }

    try {
      const apiKey = 'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ]
      });

      const candidates = response.data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("Réponse vide de Gemini.");
      }

      const geminiText = candidates[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu générer de réponse.";

      // Découper si trop long
      const parts = [];
      for (let i = 0; i < geminiText.length; i += 1800) {
        parts.push(geminiText.substring(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur avec Gemini API :", error?.response?.data || error.message);
      sendMessage(senderId, {
        text: "🤖 Oups ! Une erreur est survenue avec l'API Gemini.\nVeuillez réessayer plus tard."
      }, pageAccessToken);
    }
  }
};
