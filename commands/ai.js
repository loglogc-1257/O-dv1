const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const { manageUserAccess, getConversationHistory, addMessageToHistory, validateDailyCode, giveUnlimitedAccess, findUserById, createReferral } = require('../database.js');

const TEXTCORTEX_API_KEY = 'gAAAAABoSVlO0gyAQy__1IvMCgwn1g7lHIL2WrtZd2mxHOt6HvHP7wqBfRrgHc1MlgSJ1GZabV9gnvAJE54QSRe_0gXwUKHlAzEPiMtDXs8HlMiIE-wJI1K0XDBIEz6IlmETUsoG0KDhPQKZClRz4PfZuxJ5iYGOYBTpP2lx4DmNucJLGYeE4=';
const GEMINI_API_KEYS = [
  'AIzaSyDIGG4puPZ6kPIUR0CSD6fOgh6PNWqYFuM',
  'AIzaSyCPCItkc_2hGwufiiTgz1dqvyLbBnmozMA',
  'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE',
  'AIzaSyAm7l8P9w0MIBZm_VloFg-_yEfIfDM2O_A'
];

// FONCTION POUR ENVOYER UNE NOTIFICATION AU PARRAIN
async function notifyReferrer(referrerId, referredName, pageAccessToken) {
  const message = {
    text: `🥳 Félicitations ! Votre ami ${referredName} a été ajouté et vous avez maintenant un accès illimité pour la journée.`
  };
  await sendMessage(referrerId, message, pageAccessToken);
}

module.exports = {
  name: 'ai',
  description: 'Interact with AI (fastest responder wins)',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken, userName) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }
    
    const lowerPrompt = prompt.toLowerCase();
    
    // GESTION DES COMMANDES SPÉCIALES
    
    // Commande pour obtenir l'ID
    if (lowerPrompt === 'id') {
      return sendMessage(senderId, {
        text: `Voici votre ID unique : ${senderId}`
      }, pageAccessToken);
    }
    
    // Commande de parrainage manuel ou pour obtenir le lien
    if (lowerPrompt.startsWith('parrainer') || lowerPrompt.startsWith('invite')) {
      const friendId = prompt.split(' ')[1];
      if (!friendId) {
        const myReferralLink = `https://m.me/61579366125633?ref=invite_${senderId}`;
        return sendMessage(senderId, {
          text: `✨ Pour obtenir un accès illimité, parrainez un ami ! Voici votre lien de parrainage unique : ${myReferralLink}\n\n` +
                `Si votre ami est déjà un utilisateur, il doit vous donner son ID et vous le tapez : 'invite [son_id]'`
        }, pageAccessToken);
      }

      const friendExists = await findUserById(friendId);
      if (friendExists) {
        const referralCreated = await createReferral(senderId, friendId);
        if (referralCreated) {
          await giveUnlimitedAccess(senderId); // Le parrain gagne un accès illimité
          await notifyReferrer(senderId, "votre ami", pageAccessToken);
          return sendMessage(senderId, {
            text: `✅ Parfait ! Vous avez parrainé un ami et vous avez maintenant un accès illimité pour la journée.`
          }, pageAccessToken);
        } else {
          return sendMessage(senderId, {
            text: "❌ Ce parrainage n'a pas pu être enregistré. Peut-être que cet utilisateur a déjà été invité."
          }, pageAccessToken);
        }
      } else {
        return sendMessage(senderId, {
          text: `❌ Nous n'avons pas pu trouver d'utilisateur avec l'ID '${friendId}'. Veuillez vous assurer que votre ami a déjà interagi avec le bot.`
        }, pageAccessToken);
      }
    }
    
    // GESTION DU PARRAINAGE VIA LE LIEN AUTOMATIQUE
    if (prompt === 'referral') {
        const referrerId = prompt.split('_')[1];
        if (referrerId && referrerId !== senderId) {
            await giveUnlimitedAccess(senderId); // Le nouvel utilisateur gagne son accès illimité
            await notifyReferrer(referrerId, userName, pageAccessToken);
        }
        return sendMessage(senderId, {
            text: `🥳 Félicitations ! Vous avez été parrainé par un ami et vous avez maintenant un accès illimité pour la journée. Posez votre question.`
        }, pageAccessToken);
    }
    
    // Commande pour le code journalier
    const isCodeValid = await validateDailyCode(prompt);
    if (isCodeValid) {
        await giveUnlimitedAccess(senderId);
        return sendMessage(senderId, {
            text: "✅ Code valide ! Vous avez maintenant un accès illimité pour la journée. Posez votre question."
        }, pageAccessToken);
    }

    // GESTION DES SALUTATIONS
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

    // VÉRIFICATION DES POINTS POUR LES MESSAGES NORMAUX
    const access = await manageUserAccess(senderId, userName);
    if (!access.allowed) {
      return sendMessage(senderId, {
        text: "✨ Vos 6 questions gratuites sont terminées ! ✨\n\n" +
              "Pour un accès illimité, veuillez entrer le code journalier que vous trouverez dans notre dernière vidéo TikTok.\n\n" +
              "Lien de la dernière vidéo : " + "https://vm.tiktok.com/ZMHnCEyoJxE5H-tZJ7Y/" + "\n\n" +
              "Ou, si vous préférez, vous pouvez parrainer un ami ! Tapez 'parrainer' pour obtenir votre lien de parrainage."
      }, pageAccessToken);
    }

    // Le reste du code d'appel des APIs
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

      const getRequests = getUrls.map(url => axios.get(url).then(res => res.data));
      
      const postRequest = axios.post(
        'https://api.textcortex.com/v1/generate',
        { prompt: prompt },
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TEXTCORTEX_API_KEY}` } }
      ).then(res => res.data.text || res.data.result || '');

      const firstResponse = await Promise.any([...geminiRequests, ...getRequests, postRequest]);
      
      const response = typeof firstResponse === 'string' ? firstResponse : (
        firstResponse?.result || firstResponse?.description || firstResponse?.reponse || firstResponse?.response || JSON.stringify(firstResponse)
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
          "➡️ [Abonnez-vous ici !](https://vm.tiktok.com/ZMHnCEyoJxE5H-tZJ7Y/) 🚀"
      }, pageAccessToken);
    }
  }
};
