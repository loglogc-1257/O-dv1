const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with AI (fastest responder wins)',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    const encodedPrompt = encodeURIComponent(prompt);

    // Liste des URLs à appeler en parallèle
    const urls = [
      `https://kaiz-apis.gleeze.com/api/vondy-ai?ask=${encodedPrompt}&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://kaiz-apis.gleeze.com/api/gemini-flash-2.0?q=${encodedPrompt}&uid=1&imageUrl=&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://kaiz-apis.gleeze.com/api/you-ai?ask=${encodedPrompt}&uid=1&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`
    ];

    try {
      // Création de promesses pour chaque appel API
      const requests = urls.map(url => axios.get(url).then(res => res.data));

      // Prend la première qui répond
      const firstResponse = await Promise.any(requests);

      // Extrait un champ pertinent
      const response =
        firstResponse?.result ||
        firstResponse?.description ||
        firstResponse?.reponse ||
        firstResponse?.response ||
        firstResponse;

      if (response) {
        const parts = [];
        for (let i = 0; i < response.length; i += 1800) {
          parts.push(response.substring(i, i + 1800));
        }

        for (const part of parts) {
          await sendMessage(senderId, { text: part + ' 🪐' }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, {
          text: "Aucune réponse valide reçue de l'une des APIs."
        }, pageAccessToken);
      }
    } catch (err) {
      console.error("Erreur lors de l'appel aux APIs:", err.message || err);
      await sendMessage(senderId, {
        text: "🤖 Erreur : Impossible d'obtenir une réponse pour le moment. Essayez à nouveau plus tard."
      }, pageAccessToken);
    }
  }
};
