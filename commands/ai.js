const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const TEXTCORTEX_API_KEY = 'gAAAAABoSVlO0gyAQy__1IvMCgwn1g7lHIL2WrtZdQ2mxHOt6HvHPX7wqBfRrgHc1MlgSJ1GZabV9gnvAJE54QSRe_0gXwUKHlAzEPiMtDXs8HlMiIE-wJI1K0XDBIEz6IlmETUsoG0KDhPQKZClRz4PfZuxJ5iYGOYBTpP2lx4DmNucJLGYeE4=';

module.exports = {
  name: 'ai',
  description: 'Interact with AI (fastest responder wins)',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }

    const lowerPrompt = prompt.toLowerCase();
    const greetings = ['salut', 'hi', 'hello', 'bonjour'];

    if (greetings.includes(lowerPrompt)) {
      return sendMessage(senderId, {
        text:
          "👋 Bonjour et bienvenue !\n\n" +
          "Merci d'utiliser notre intelligence artificielle. 🙏\n\n" +
          "✨ Pour nous aider, n'hésitez pas à partager cette IA dans vos groupes et à inviter vos amis à la découvrir.\n\n" +
          "✅ Votre satisfaction est notre priorité absolue."
      }, pageAccessToken);
    }

    const encodedPrompt = encodeURIComponent(prompt);

    const getUrls = [
      `https://kaiz-apis.gleeze.com/api/vondy-ai?ask=${encodedPrompt}&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://kaiz-apis.gleeze.com/api/gemini-flash-2.0?q=${encodedPrompt}&uid=1&imageUrl=&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://kaiz-apis.gleeze.com/api/you-ai?ask=${encodedPrompt}&uid=1&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://text.pollinations.ai/${encodedPrompt}`
    ];

    try {
      const getRequests = getUrls.map(url =>
        axios.get(url).then(res => res.data)
      );

      const postRequest = axios.post(
        'https://api.textcortex.com/v1/generate',
        { prompt: prompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEXTCORTEX_API_KEY}`
          }
        }
      ).then(res => {
        return res.data.text || res.data.result || '';
      });

      const firstResponse = await Promise.any([...getRequests, postRequest]);

      const response =
        typeof firstResponse === 'string' ? firstResponse : (
          firstResponse?.result ||
          firstResponse?.description ||
          firstResponse?.reponse ||
          firstResponse?.response ||
          JSON.stringify(firstResponse)
        );

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
        text:
          "✨🌟 Découvrez notre nouvelle alternative de bot AI simple ! ✨🌟\n\n" +
          "Besoin d'un assistant virtuel fiable et disponible 24/7 ? Notre nouvelle alternative de bot AI est là pour vous ! " +
          "Il répond à toutes vos questions avec des informations à jour et vous aide dans toutes vos démarches. " +
          "Ne manquez pas cette opportunité de simplifier votre vie quotidienne !\n\n" +
          "Cliquez ici pour découvrir notre IA : [Découvrez notre IA](https://www.facebook.com/profile.php?id=100085014123974) 🌈✨"
      }, pageAccessToken);
    }
  }
};
