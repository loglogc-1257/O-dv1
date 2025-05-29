const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const getImageUrl = async (event, token) => {
  const mid = event?.message?.reply_to?.mid || event?.message?.mid;
  if (!mid) return null;

  try {
    const { data } = await axios.get(`https://graph.facebook.com/v22.0/${mid}/attachments`, {
      params: { access_token: token }
    });

    const imageUrl = data?.data?.[0]?.image_data?.url || data?.data?.[0]?.file_url || null;
    return imageUrl;
  } catch (err) {
    console.error("Image URL fetch error:", err?.response?.data || err.message);
    return null;
  }
};

const conversationHistory = {};

module.exports = {
  name: 'ai',
  description: 'Interact with Mocha AI using text queries and image analysis',
  usage: 'ask a question, or send a reply question to an image.',
  author: 'Messie Osango',

  async execute(senderId, args, pageAccessToken, event) {
    let prompt = args.join(' ').trim() || 'Hello';

    try {
      if (!conversationHistory[senderId]) {
        conversationHistory[senderId] = [];
      }

      // Ajoute la question utilisateur à l'historique
      conversationHistory[senderId].push({ role: 'user', content: prompt });

      // Garde uniquement les 5 derniers échanges (user + assistant)
      if (conversationHistory[senderId].length > 10) {
        conversationHistory[senderId] = conversationHistory[senderId].slice(-10);
      }

      // Compose un prompt combiné à partir de l'historique
      // Format simple : "User: ... \n Assistant: ..."
      let combinedPrompt = conversationHistory[senderId]
        .map(msg => (msg.role === 'user' ? 'Utilisateur: ' : 'Assistant: ') + msg.content)
        .join('\n') + '\nAssistant:';

      const imageUrl = await getImageUrl(event, pageAccessToken);
      if (imageUrl) {
        combinedPrompt += `\n[Image URL: ${imageUrl}]`;
      }

      const encodedPrompt = encodeURIComponent(combinedPrompt);

      const { data } = await axios.get(
        `https://api.zetsu.xyz/api/copilot`,
        {
          params: {
            prompt: encodedPrompt,
            apikey: 'dfc3db8eeb9991ebed1880d4b153625f'
          }
        }
      );

      const fullResponseText = data?.result || data?.response || data;

      if (!fullResponseText) {
        throw new Error('Réponse vide de l’IA.');
      }

      // Ajoute la réponse de l'assistant à l'historique
      conversationHistory[senderId].push({ role: 'assistant', content: fullResponseText });

      const chunkMessage = (message, maxLength) => {
        const chunks = [];
        for (let i = 0; i < message.length; i += maxLength) {
          chunks.push(message.slice(i, i + maxLength));
        }
        return chunks;
      };

      const messageChunks = chunkMessage(fullResponseText, 1900);
      for (const chunk of messageChunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      console.error("Erreur:", err?.response?.data || err.message);
      await sendMessage(senderId, { text: "Oups, 🎃🚬 une erreur s'est produite." }, pageAccessToken);
    }
  },
};