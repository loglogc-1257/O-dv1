const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with Orochi AI',
  usage: 'gpt4 [your message]',
  author: 'Delfa',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) {
      return sendMessage(senderId, {
        text: "𝐒𝐚𝐥𝐮𝐭 👋 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐎𝐫𝐨𝐜𝐡𝐢 𝐯𝐨𝐭𝐫𝐞 𝐜𝐡𝐚𝐭𝐛𝐨𝐭,𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐩𝐨𝐬𝐞𝐫 𝐥𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚 𝐯𝐨𝐭𝐫𝐞 𝐜𝐨𝐧𝐯𝐞𝐧𝐚𝐧𝐜𝐞 𝐞𝐭 𝐣𝐞 𝐦'𝐞𝐟𝐟𝐨𝐫𝐜𝐞𝐫𝐚𝐢 𝐝𝐞 𝐯𝐨𝐮𝐬  𝐟𝐨𝐮𝐫𝐧𝐢𝐫 𝐮𝐧𝐞 𝐫𝐞𝐩𝐨𝐧𝐬𝐞 𝐞𝐟𝐟𝐢𝐜𝐚𝐜𝐞 🙂🤓. 𝐕𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐞𝐬𝐭 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é 𝐚𝐛𝐬𝐨𝐥𝐮𝐞 🤖."
      }, pageAccessToken);
    }

    try {
      const { data } = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4.1?ask=${encodeURIComponent(prompt)}&uid=${senderId}&imageUrl=&apikey=5a7cf1b8-9ad1-4f0d-b38a-c5c0eedb1507`);

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
        text: "𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐫é𝐞𝐬𝐬𝐚𝐲𝐞𝐫 𝐩𝐥𝐮𝐬 𝐭𝐚𝐫𝐝 🙂\n\n" + "𝐯𝐨𝐮𝐬 ê𝐭𝐞𝐬 𝐭𝐫è𝐬 𝐧𝐨𝐦𝐛𝐫𝐞𝐮𝐱 𝐞𝐭 𝐦𝐨𝐧 𝐬𝐞𝐫𝐯𝐞𝐮𝐫 𝐞𝐬𝐭 𝐮𝐧 𝐩𝐞𝐮 𝐬𝐮𝐫𝐜𝐡𝐚𝐫𝐠é."
      }, pageAccessToken);
    }
  }
};