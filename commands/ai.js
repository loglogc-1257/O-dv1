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
      const defaultMessage = "⛷𝙅e 𝒗𝒐𝒖𝒔 𝒑𝒓𝒊𝒆 ძe me ⍴résen𝗍er 𝒍𝒂 𝒒𝒖𝒆𝒔𝒕𝒊𝒐𝒏 𝙨𝙚𝙡𝙤𝙣 𝙫𝙤𝙩𝙧𝙚 préférence⚜, 𝙚𝙩 𝙟𝙚 𝙢'𝙚𝙢𝙥𝙡𝙤𝙞𝙚𝙧𝙖𝙞 à 𝕧𝕠𝕦𝕤 𝕠𝕗𝕗𝕣𝕚𝕣 𝕦𝕟𝕖 réponse 𝕡𝕖𝕣𝕥𝕚𝕟𝕖𝕟𝕥𝕖 𝕖𝕥 adéquate.❤ 𝐒𝐚𝐜𝐡𝐞𝐳 𝐪𝐮𝐞 𝐯𝐨𝐭𝐫𝐞 𝐬𝐚𝐭𝐢𝐬𝐟𝐚𝐜𝐭𝐢𝐨𝐧 𝐝𝐞𝐦𝐞𝐮𝐫𝐞 𝐦𝐚 𝐩𝐫𝐢𝐨𝐫𝐢𝐭é à 𝐭𝐨𝐮𝐭𝐞𝐬 é𝐠𝐚𝐫𝐝𝐬😉.(merci pour votre attention)";
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

    const answeringMessage = `⏳ 𝗝𝘂𝘀𝘁 𝗪𝗮𝗶𝘁...`;
    const formattedAnsweringMessage = useFontFormatting ? formatResponse(answeringMessage) : answeringMessage;
    await sendMessage(senderId, { text: formattedAnsweringMessage }, pageAccessToken);

    const defaultMessage = `Free GPT / OpenAI

♦︎|☛𝗝𝗼𝗸𝗲𝗿᭄
✅ Answer: ${response}
▬▭▬ ▬▭▬✧▬▭▬ ▬▭▬
⏰ Response: ${responseTime}`;

    const formattedMessage = useFontFormatting ? formatResponse(defaultMessage) : defaultMessage;

    await sendConcatenatedMessage(senderId, formattedMessage, pageAccessToken);
  } catch (error) {
    console.error('Error while processing AI response:', error.message);

    const errorMessage = '❌ Ahh sh1t error again.';
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
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
    'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾',
    'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
    'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤',
    'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  };

  return responseText.split('').map(char => fontMap[char] || char).join('');
  }
