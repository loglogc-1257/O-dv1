const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8');

// [ true if turn on font & false if turn off ]
const useFontFormatting = true;

module.exports = {
  name: 'ai',
  description: 'Interact to Free GPT - OpenAI.',
  author: 'Arn', // API by Kenlie Navacilla Jugarap

  async execute(senderId, args) {
    const pageAccessToken = token;
    const query = args.join(" ").toLowerCase();

    if (!query) {
      const defaultMessage = "𝐒𝐚𝐥𝐮𝐭 👋 𝐣𝐞 𝐬𝐮𝐢𝐬 𝐎𝐫𝐨𝐜𝐡𝐢 𝐯𝐨𝐭𝐫𝐞 𝐜𝐡𝐚𝐭𝐛𝐨𝐭,𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐩𝐨𝐬𝐞𝐫 𝐥𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧 𝐚 𝐯𝐨𝐭𝐫𝐞 𝐜𝐨𝐧𝐯𝐞𝐧𝐚𝐧𝐜𝐞 𝐞𝐭 𝐣𝐞 𝐦'𝐞𝐟𝐟𝐨𝐫𝐜𝐞𝐫𝐚𝐢 𝐝𝐞 𝐯𝐨𝐮𝐬  𝐟𝐨𝐮𝐫𝐧𝐢𝐫 𝐮𝐧𝐞 𝐫𝐞𝐩𝐨𝐧𝐬𝐞 𝐞𝐟𝐟𝐢𝐜𝐚𝐜𝐞 🙂🤓. 𝐕𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐞𝐬𝐭 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é 𝐚𝐛𝐬𝐨𝐥𝐮𝐞 🤖. (𝐄𝐝𝐢𝐭 𝐛𝐲 𝐃𝐞𝐥𝐟𝐚 𝐟𝐫𝐨𝐬𝐭)";
      const formattedMessage = useFontFormatting ? formatResponse(defaultMessage) : defaultMessage;
      return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    }

    if (query === "sino creator mo?" || query === "who created you?") {
      const jokeMessage = "Arn/Rynx Gaiser";
      const formattedMessage = useFontFormatting ? formatResponse(jokeMessage) : jokeMessage;
      return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/bert-ai";

  try {
    const aidata = await axios.get(apiUrl, { params: { q: input, uid: senderId } });
    let response = aidata.data.response;

    const responseTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour12: true });

    const answeringMessage = `⏳𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐩𝐚𝐭𝐢𝐞𝐧𝐭𝐞𝐫 𝐮𝐧 𝐢𝐧𝐬𝐭𝐚𝐧𝐭...`;
    const formattedAnsweringMessage = useFontFormatting ? formatResponse(answeringMessage) : answeringMessage;
    await sendMessage(senderId, { text: formattedAnsweringMessage }, pageAccessToken);

    const defaultMessage = `𝐎𝐫𝐨𝐜𝐡𝐢 𝐀𝐈 🤖
    
 ${response}`;
    
    const formattedMessage = useFontFormatting ? formatResponse(defaultMessage) : defaultMessage;

    await sendConcatenatedMessage(senderId, formattedMessage, pageAccessToken);
  } catch (error) {
    console.error('Error while processing AI response:', error.message);

    const errorMessage = '𝐕𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐫é𝐞𝐬𝐬𝐚𝐲𝐞𝐫 𝐩𝐥𝐮𝐬 𝐭𝐚𝐫𝐝 🙂, 𝐯𝐨𝐮𝐬 ê𝐭𝐞𝐬 𝐭𝐫è𝐬 𝐧𝐨𝐦𝐛𝐫𝐞𝐮𝐱 𝐞𝐭 𝐦𝐨𝐧 𝐬𝐞𝐫𝐯𝐞𝐮𝐫 𝐞𝐬𝐭 𝐮𝐧 𝐩𝐞𝐮 𝐬𝐮𝐫𝐜𝐡𝐚𝐫𝐠é.';
    const formattedMessage = useFontFormatting ? formatResponse(errorMessage) : errorMessage;
    await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
  }
};

const sendConcatenatedMessage = async (senderId, text, pageAccessToken) => {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
};

const splitMessageIntoChunks = (message, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
};

function formatResponse(responseText) {
  const fontMap = {
    ' ': ' ',
    'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
    'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p', 'q': 'q',
    'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H',
    'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q',
    'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  };

  return responseText.split('').map(char => fontMap[char] || char).join('');
                                                      }
