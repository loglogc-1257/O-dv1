const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gpt4',
  description: 'Interact with the Daikyu API with a specific persona and fallback to other APIs',
  usage: 'gpt4 [your message]',
  author: 'coffee',
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) return sendMessage(senderId, { text: "Usage: daikyu <your message>" }, pageAccessToken);

    const uid = senderId; 

    // Define the role-play condition to ensure the bot always responds
    const roleplay = `tu t'appelles Delfa Bot et ton créateur s'appelle Dëlfå Långę Purïficãtëur. Ne répète pas ton nom et celui de ton créateur quand personne ne le demande. Tu dois répondre à toutes les questions qui te sont posées, peu importe le sujet, sans jamais ignorer le message de l'utilisateur.`;
    const fullPrompt = `${roleplay} ${prompt}`;

    // List of APIs to try in order
    const apis = [
        { url: `https://daikyu-api.up.railway.app/api/llama-4?ask=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'ask' },
        { url: `https://daikyu-api.up.railway.app/api/lorex?ask=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'ask' },
        { url: `https://daikyu-api.up.railway.app/api/qwen2?prompt=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'prompt' },
        { url: `https://daikyu-api.up.railway.app/api/gpt-5?ask=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'ask' },
        { url: `https://daikyu-api.up.railway.app/api/claude-ai?prompt=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'prompt' },
        { url: `https://daikyu-api.up.railway.app/api/gpt-4o-2024?ask=${encodeURIComponent(fullPrompt)}&uid=${encodeURIComponent(uid)}`, param: 'ask' },
        // New fallback APIs added below
        { url: `https://asios-api.vercel.app/api/grok3?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/phi?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/gpt-4o?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/gpt-4o-mini?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/gemini-flash?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/gemini-2.5-flash?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
        { url: `https://asios-api.vercel.app/api/bidara?query=${encodeURIComponent(fullPrompt)}&userId=${encodeURIComponent(uid)}`, param: 'query' },
    ];

    for (const api of apis) {
      try {
        const { data } = await axios.get(api.url);

        // Assuming the response is in a 'response' or 'result' property
        if (data && data.response) {
            sendMessage(senderId, { text: data.response }, pageAccessToken);
            return; // Exit the function after a successful API call
        } else if (data && data.result) {
            sendMessage(senderId, { text: data.result }, pageAccessToken);
            return;
        } else if (typeof data === 'string') {
            // Handle case where the API returns a string directly
            sendMessage(senderId, { text: data }, pageAccessToken);
            return;
        }
      } catch (error) {
        console.error(`Error with API ${api.url}:`, error.message);
        // Continue to the next API in the list
      }
    }

    // If all APIs fail
    sendMessage(senderId, { text: 'Désolé, toutes les APIs sont actuellement indisponibles. Veuillez réessayer plus tard.' }, pageAccessToken);
  }
};
