const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8').trim();
const chatHistory = {}; // Objet pour stocker l'historique des conversations par utilisateur

module.exports = {
  name: 'ai',
  description: 'Interagissez avec Orochi AI.',
  author: 'Arn & coffee',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(" ").trim();

    if (!query) {
      const defaultMessage = 
        "✨ 𝐒𝐚𝐥𝐮𝐭 👋" +
        " 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐎𝐫𝐨𝐜𝐡𝐢 𝐯𝐨𝐭𝐫𝐞 𝐜𝐡𝐚𝐭𝐛𝐨𝐭" +
        "\n\n𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐩𝐨𝐬𝐞𝐫 𝐥𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚 𝐯𝐨𝐭𝐫𝐞 𝐜𝐨𝐧𝐯𝐞𝐧𝐚𝐧𝐜𝐞 𝐞𝐭 𝐣𝐞 𝐦'𝐞𝐟𝐟𝐨𝐫𝐜𝐞𝐫𝐚𝐢 𝐝𝐞 𝐯𝐨𝐮𝐬  𝐟𝐨𝐮𝐫𝐧𝐢𝐫 𝐮𝐧𝐞 𝐫𝐞𝐩𝐨𝐧𝐬𝐞 𝐞𝐟𝐟𝐢𝐜𝐚𝐜𝐞 🙂🤓. 𝐕𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐞𝐬𝐭 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é 𝐚𝐛𝐬𝐨𝐥𝐮𝐞\n\n_(𝐄𝐝𝐢𝐭é 𝐩𝐚𝐫 𝐃𝐞𝐥𝐟𝐚 𝐟𝐫𝐨𝐬𝐭)_";

      return await sendMessage(senderId, { text: defaultMessage }, pageAccessToken);
    }

    if (["sino creator mo?", "qui t'a créé ?"].includes(query.toLowerCase())) {
      return await sendMessage(senderId, { text: "Stanley Stawa" }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

  // Initialiser l'historique si l'utilisateur est nouveau
  if (!chatHistory[senderId]) {
    chatHistory[senderId] = [];
  }

  // Ajouter la question à l'historique
  chatHistory[senderId].push({ role: "user", message: input });

  try {
    // Envoyer la requête à l'API GPT-4o
    const { data } = await axios.get(apiUrl, { 
      params: { 
        ask: input, 
        uid: senderId, 
        webSearch: "off" 
      } 
    });

    const response = data.response;

    // Ajouter la réponse de l'IA à l'historique
    chatHistory[senderId].push({ role: "ai", message: response });

    await sendLongMessage(senderId, response, pageAccessToken);
  } catch (error) {
    console.error('Erreur AI:', error.message);
    await sendMessage(senderId, { text: "⚠️ Veuillez patienter un instant !" }, pageAccessToken);
  }
};

// Fonction pour gérer les messages longs
const sendLongMessage = async (senderId, message, pageAccessToken) => {
  const maxLength = 9000; // Longueur maximale par message
  let parts = [];

  for (let i = 0; i < message.length; i += maxLength) {
    parts.push(message.substring(i, i + maxLength));
  }

  for (let i = 0; i < parts.length; i++) {
    await sendMessage(senderId, { text: parts[i] }, pageAccessToken);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pause de 500ms entre chaque envoi
  }
};