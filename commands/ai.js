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
        text: " poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    try {
      // Appel à l'API Pollinations
      const { data } = await axios.get(`https://text.pollinations.ai/salut?text=${encodeURIComponent(prompt)}`);

      // Fragmentation si le texte est trop long
      const parts = [];
      for (let i = 0; i < data.length; i += 1800) {
        parts.push(data.substring(i, i + 1800));
      }

      // Envoi de la réponse en plusieurs messages
      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur Pollinations:", error?.response?.data || error.message);
      sendMessage(senderId, {
        text: "🤖 Oups ! Une erreur est survenue avec l'API Pollinations.\\Veuillez réessayer plus tard."
      }, pageAccessToken);
    }
  }
};