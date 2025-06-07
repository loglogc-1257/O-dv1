const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interagit avec Pollinations (Stanley Bot)',
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
      // Utilisation de l'API Pollinations
      const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;
      const { data } = await axios.get(url);

      if (!data || typeof data !== 'string') {
        return sendMessage(senderId, {
          text: "🤖 Je n'ai pas pu générer de réponse avec Pollinations. Essaie encore.",
        }, pageAccessToken);
      }

      // Découpe si trop long (Messenger a une limite de ~2000 caractères)
      const parts = [];
      for (let i = 0; i < data.length; i += 1800) {
        parts.push(data.slice(i, i + 1800));
      }

      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur avec Pollinations API :", error?.response?.data || error.message);
      await sendMessage(senderId, {
        text: "⚠️ Une erreur est survenue avec Pollinations. Réessaye plus tard.",
      }, pageAccessToken);
    }
  }
};
