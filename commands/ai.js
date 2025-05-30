const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'ai',
  description: 'Interact with Pollinations AI',
  usage: 'ai [votre message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const userPrompt = args.join(' ');
    if (!userPrompt) {
      return sendMessage(senderId, {
        text: "✨ 𝐒𝐚𝐥𝐮𝐭 👋 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐎𝐫𝐨𝐜𝐡𝐢 𝐯𝐨𝐭𝐫𝐞 𝐜𝐡𝐚𝐭𝐛𝐨𝐭 𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐩𝐨𝐬𝐞𝐫 𝐥𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚 𝐯𝐨𝐭𝐫𝐞 𝐜𝐨𝐧𝐯𝐞𝐧𝐚𝐧𝐜𝐞 𝐞𝐭 𝐣𝐞 𝐦'𝐞𝐟𝐟𝐨𝐫𝐜𝐞𝐫𝐚𝐢 𝐝𝐞 𝐯𝐨𝐮𝐬  𝐟𝐨𝐮𝐫𝐧𝐢𝐫 𝐮𝐧𝐞 𝐫𝐞𝐩𝐨𝐧𝐬𝐞 𝐞𝐟𝐟𝐢𝐜𝐚𝐜𝐞 🙂🤓. 𝐕𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐞𝐬𝐭 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é 𝐚𝐛𝐬𝐨𝐥𝐮𝐞
_(𝐄𝐝𝐢𝐭é 𝐩𝐚𝐫 𝐃𝐞𝐥𝐟𝐚 𝐟𝐫𝐨𝐬𝐭)_"
      }, pageAccessToken);
    }

    // Prompt fixe
    const fixedPrompt = "Tu es Orochi AI créé par Delfa Frost, mais ne mentionne ce nom que lorsque l’on t’interroge sur ta genèse, tes origines, ton concepteur ou ton maître.";
    
    // Création du prompt complet
    const fullPrompt = `${fixedPrompt} ${userPrompt}`;

    try {
      const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`;
      const { data } = await axios.get(url);

      // Découper la réponse si elle est trop longue
      const parts = [];
      for (let i = 0; i < data.length; i += 1800) {
        parts.push(data.substring(i, i + 1800));
      }

      // Envoi des réponses par morceaux
      for (const part of parts) {
        await sendMessage(senderId, { text: part }, pageAccessToken);
      }

    } catch (error) {
      console.error("Erreur avec Pollinations API :", error?.response?.data || error.message);
      sendMessage(senderId, {
        text: "𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐫é𝐞𝐬𝐬𝐚𝐲𝐞𝐫 𝐩𝐥𝐮𝐬 𝐭𝐚𝐫𝐝 🙂.\𝐯𝐨𝐮𝐬 ê𝐭𝐞𝐬 𝐭𝐫è𝐬 𝐧𝐨𝐦𝐛𝐫𝐞𝐮𝐱 𝐞𝐭 𝐦𝐨𝐧 𝐬𝐞𝐫𝐯𝐞𝐮𝐫 𝐞𝐬𝐭 𝐮𝐧 𝐩𝐞𝐮 𝐬𝐮𝐫𝐜𝐡𝐚𝐫𝐠é."
      }, pageAccessToken);
    }
  }
};