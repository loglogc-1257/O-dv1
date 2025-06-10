const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with Gemini AI',
  usage: 'ai [votre message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const userPrompt = args.join(' ').trim();
    if (!userPrompt) {
      return sendMessage(senderId, {
        text: "❓ Veuillez poser votre question."
      }, pageAccessToken);
    }

    const apiKey = 'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE'; // Clé API directement dans le code

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await axios.post(url, {
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.9,       // plus créatif
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: []
        }
      }, {
        timeout: 20000
      });

      const candidates = response.data?.candidates;
      const geminiText = candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!geminiText) {
        throw new Error("Réponse vide ou mal formée de Gemini.");
      }

      // Découpe la réponse si trop longue
      const parts = [];
      for (let i = 0; i < geminiText.length; i += 1800) {
        parts.push(geminiText.slice(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      const res = error?.response;
      let msg = "🤖 Une erreur est survenue avec l'API Gemini.";

      if (res) {
        switch (res.status) {
          case 400:
            msg += "\n📭 Requête invalide. Reformulez votre question.";
            break;
          case 401:
          case 403:
            msg += "\n🔐 Clé API invalide ou non autorisée.";
            break;
          case 429:
            msg += "\n🚫 Trop de requêtes envoyées. Veuillez réessayer plus tard.";
            break;
          case 500:
          case 503:
            msg += "\n🛠️ Service Gemini temporairement indisponible.";
            break;
          default:
            msg += `\nCode d'erreur : ${res.status}`;
        }
        console.error("Gemini API error:", res.data);
      } else if (error.code === 'ECONNABORTED') {
        msg += "\n⌛ Temps dépassé (20 sec).";
      } else {
        msg += `\n${error.message}`;
      }

      await sendMessage(senderId, { text: msg }, pageAccessToken);
    }
  }
};
