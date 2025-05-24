const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with You-AI',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    try {
      const { data } = await axios.get(`const API_KEY = "AIzaSyBN4UIH-n3ZKDqXggccAatrcpi_fBf6XiA";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`);

      if (data.response) {
        // Cas 1 : réponse textuelle normale
        const parts = [];
        for (let i = 0; i < data.response.length; i += 1800) {
          parts.push(data.response.substring(i, i + 1800));
        }

        for (const part of parts) {
          await sendMessage(senderId, { text: part }, pageAccessToken);
        }

        if (data.images) {
          await sendMessage(senderId, {
            text: `Voici l'image générée : ${data.images}`
          }, pageAccessToken);
        }

      } else if (data.results && Array.isArray(data.results)) {
        // Cas 2 : résultats type recherche (liste d'objets)
        const formattedResults = data.results.map((item, index) => {
          return `*${index + 1}. ${item.title}*\n${item.snippet}\n${item.link}`;
        }).join('\n\n');

        const parts = [];
        for (let i = 0; i < formattedResults.length; i += 1800) {
          parts.push(formattedResults.substring(i, i + 1800));
        }

        for (const part of parts) {
          await sendMessage(senderId, { text: part }, pageAccessToken);
        }

      } else {
        await sendMessage(senderId, {
          text: "Aucune réponse valide reçue de l'API."
        }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur API AI:", err.message || err);
      sendMessage(senderId, {
        text: "🤖 Oups ! Une petite erreur est survenue.\n\n" +
              "❓ Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }
  }
};