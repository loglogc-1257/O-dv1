const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const { manageUserAccess, getConversationHistory, addMessageToHistory, validateDailyCode, giveUnlimitedAccess } = require('../database.js');

const TEXTCORTEX_API_KEY = 'gAAAAABoSVlO0gyAQy__1IvMCgwn1g7lHIL2WrtZdQ2mxHOt6HvHP7wqBfRrgHc1MlgSJ1GZabV9gnvAJE54QSRe_0gXwUKHlAzEPiMtDXs8HlMiIE-wJI1K0XDBIEz6IlmETUsoG0KDhPQKZClRz4PfZuxJ5iYGOYBTpP2lx4DmNucJLGYeE4=';
const GEMINI_API_KEYS = [
  'AIzaSyDIGG4puPZ6kPIUR0CSD6fOgh6PNWqYFuM',
  'AIzaSyCPCItkc_2hGwufiiTgz1dqvyLbBnmozMA',
  'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE',
  'AIzaSyAm7l8P9w0MIBZm_VloFg-_yEfIfDM2O_A'
];

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

    const access = await manageUserAccess(senderId);

    if (!access.allowed) {
      const isCodeValid = await validateDailyCode(prompt);
      if (isCodeValid) {
        await giveUnlimitedAccess(senderId);
        return sendMessage(senderId, {
          text: "✅ Code valide ! Vous avez maintenant un accès illimité pour la journée. Posez votre question."
        }, pageAccessToken);
      } else {
        return sendMessage(senderId, {
          text: "✨ Vos 6 questions gratuites sont terminées ! ✨\n\n" +
                "Pour un accès illimité, veuillez entrer le code journalier que vous trouverez sur nos vidéos TikTok.
          https://vm.tiktok.com/ZMHnCWhcH85Cu-mv3f5/  "
        }, pageAccessToken);
      }
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

    await addMessageToHistory(senderId, 'user', prompt);
    const history = await getConversationHistory(senderId);

    const getUrls = [
      `https://kaiz-apis.gleeze.com/api/vondy-ai?ask=${encodeURIComponent(prompt)}&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://kaiz-apis.gleeze.com/api/you-ai?ask=${encodeURIComponent(prompt)}&uid=1&apikey=1746c05f-4329-46af-a65a-ca8bff8002e6`,
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
    ];

    try {
      const geminiRequests = GEMINI_API_KEYS.map(key => {
        const contents = history.map(msg => ({
          parts: [{ text: msg.text }],
          role: msg.role === 'user' ? 'user' : 'model'
        }));

        return axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          { contents },
          { headers: { 'Content-Type': 'application/json' } }
        ).then(res => res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
      });

      const getRequests = getUrls.map(url =>
        axios.get(url).then(res => res.data)
      );

      const postRequest = axios.post(
        'https://api.textcortex.com/v1/generate',
        { prompt: prompt },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEXTCORTEX_API_KEY}` } }
      ).then(res => res.data.text || res.data.result || '');

      const firstResponse = await Promise.any([...geminiRequests, ...getRequests, postRequest]);

      const response = typeof firstResponse === 'string' ? firstResponse : (
        firstResponse?.result ||
        firstResponse?.description ||
        firstResponse?.reponse ||
        firstResponse?.response ||
        JSON.stringify(firstResponse)
      );

      if (response) {
        await addMessageToHistory(senderId, 'model', response);

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
          "Merci d'avoir utilisé notre IA ! 🙏\n\n" +
          "Nous rencontrons actuellement un problème technique. Nos développeurs travaillent sans relâche pour le résoudre le plus rapidement possible. 🛠️\n\n" +
          "En attendant, pour nous soutenir et rester informés des nouveautés, n'oubliez pas de vous **abonner à notre compte TikTok** et d'inviter vos amis à découvrir notre service !\n\n" +
          "➡️ [Abonnez-vous ici !](https://www.tiktok.com/@ton_compte_tiktok) 🚀"
      }, pageAccessToken);
    }
  }
};
