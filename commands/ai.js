const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

// Lecture sécurisée du token PageBot
let token;
try {
    token = fs.readFileSync('token.txt', 'utf8').trim();
} catch (error) {
    console.error("Erreur lors de la lecture du fichier token.txt :", error.message);
    token = ""; // Assurez-vous qu'il ne reste pas undefined
}

// Activer/désactiver le formatage en gras
const useFontFormatting = true;

module.exports = {
    name: 'ai',
    description: 'Répondeur automatique utilisant GPT-4o.',
    author: 'PageBot Developer',

    async execute(senderId, args) {
        const pageAccessToken = token;
        const query = args.join(" ").trim();

        if (!query) {
            const defaultMessage = "🔹 Veuillez poser votre question et j'y répondrai avec plaisir ! 🤖";
            const formattedMessage = useFontFormatting ? formatResponse(defaultMessage) : defaultMessage;
            return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
        }

        if (query.toLowerCase() === "qui t'a créé?" || query.toLowerCase() === "who created you?") {
            const jokeMessage = "🤖 J'ai été conçu par l'équipe PageBot !";
            const formattedMessage = useFontFormatting ? formatResponse(jokeMessage) : jokeMessage;
            return await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
        }

        await handleChatResponse(senderId, query, pageAccessToken);
    },
};

const handleChatResponse = async (senderId, input, pageAccessToken) => {
    const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o";

    try {
        const waitingMessage = "⏳ Un instant, je réfléchis à votre question...";
        const formattedWaitingMessage = useFontFormatting ? formatResponse(waitingMessage) : waitingMessage;
        await sendMessage(senderId, { text: formattedWaitingMessage }, pageAccessToken);

        // Requête API
        const response = await axios.get(apiUrl, { params: { q: input, uid: senderId } });

        if (!response.data || !response.data.response) {
            throw new Error("Réponse API invalide.");
        }

        const answer = response.data.response;
        const responseTime = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', hour12: true });

        const finalMessage = `🤖 Réponse : ${answer}  
🕒 Heure : ${responseTime}`;

        const formattedMessage = useFontFormatting ? formatResponse(finalMessage) : finalMessage;

        await sendConcatenatedMessage(senderId, formattedMessage, pageAccessToken);
    } catch (error) {
        console.error("Erreur GPT-4o :", error.message);

        const errorMessage = "❌ Oups, une erreur est survenue. Réessayez plus tard.";
        const formattedMessage = useFontFormatting ? formatResponse(errorMessage) : errorMessage;
        await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);
    }
};

// Fonction pour envoyer un message en plusieurs parties si nécessaire
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

// Fonction pour découper les messages trop longs
const splitMessageIntoChunks = (message, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
        chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
};

// Fonction pour formater le texte avec une police spéciale
function formatResponse(responseText) {
    const fontMap = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
        'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
        'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
        'y': '𝘆', 'z': '𝘇', 'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙',
        'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩',
        'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
    };

    return responseText.split('').map(char => fontMap[char] || char).join('');
}
