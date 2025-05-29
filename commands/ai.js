const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with Pollinations AI',
  usage: 'ai [votre message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    try {
      // Encodage du prompt dans l'URL
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
      const { data } = await axios.get(url);

      // Si le texte est trop long, le découper
      const parts = [];
      for (let i = 0; i < data.length; i += 1800) {
        parts.push(data.substring(i, i + 1800));
      }

      // Envoi en plusieurs messages si nécessaire
      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur avec Pollinations API :", error?.response?.data || error.message);
      sendMessage(senderId, {
        text: "🤖 Oups ! Une erreur est survenue avec l'API Pollinations.\\Veuillez réessayer plus tard."
      }, pageAccessToken);
    }
  }
};