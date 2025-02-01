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
      const defaultMessage = " 𝗩𝗲𝘂𝗶𝗹𝗹𝗲𝘇 𝗽𝗼𝘀𝗲𝗿 𝗹𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗮 𝘃𝗼𝘁𝗿𝗲 𝗰𝗼𝗻𝘃𝗲𝗻𝗮𝗻𝗰𝗲 𝗲𝘁 𝗷𝗲 𝗺'𝗲𝗳𝗳𝗼𝗿𝗰𝗲𝗿𝗮𝗶 𝗱𝗲 𝘃𝗼𝘂𝘀 𝗳𝗼𝘂𝗿𝗻𝗶𝗿 𝘂𝗻𝗲 𝗿𝗲𝗽𝗼𝗻𝘀𝗲 𝗲𝗳𝗳𝗶𝗰𝗮𝗰𝗲 🙂🤓. 𝗩𝗼𝘁𝗿𝗲 𝘀𝗮𝘁𝗶𝘀𝗳𝗮𝗰𝘁𝗶𝗼𝗻 𝗲𝘀𝘁 𝗺𝗮 𝗽𝗿𝗶𝗼𝗿𝗶𝘁é 𝗮𝗯𝘀𝗼𝗹𝘂𝗲 🤖. (𝗘𝗱𝗶𝘁 𝗯𝘆 𝗗𝗲𝗹𝗳𝗮 𝗳𝗿𝗼𝘀𝘁) ";      const formattedMessage = useFontFormatting ? formatResponse(defaultMessage) : defaultMessage;
      return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    }

    if (query === "QUI TA CRÉÉ " || query === "who created you?") {
      const jokeMessage = "ʚʆɞ Dëlfå Frõst ʚʆɞ";
      const formattedMessage = useFontFormatting ? formatResponse(jokeMessage) : jokeMessage;
      return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    }

    await handleChatResponse(senderId, query, pageAccessToken);
  },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
  const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

  try {
    const aidata = await axios.get(apiUrl, { params: { q: input, uid: senderId } });
    let response = aidata.data.response;

    const responseTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour12: true });

    const answeringMessage = `⏳ 𝗔𝗵 𝘃𝗲𝘂𝗶𝗹𝗹𝗲𝘇 𝗽𝗮𝘁𝗶𝗲𝗻𝘁𝗲𝗿 𝗷𝗲 𝗰𝗼𝗻𝘀𝘂𝗹𝘁𝗲 𝗗𝗲𝗹𝗳𝗮 .....`;    const formattedAnsweringMessage = useFontFormatting ? formatResponse(answeringMessage) : answeringMessage;
    await sendMessage(senderId, { text: formattedAnsweringMessage }, pageAccessToken);

    const defaultMessage = `𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗽𝗲𝘂𝗿 👨‍💻 : ʚʆɞ Dëlfå Frõst ʚʆɞ
    
  𝗦𝗮𝘁𝗼𝗿𝘂 𝘁𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲 𝗯𝗼𝘁 🤖
✅ Answer: ${response}
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
