const axios = require('axios');
const moment = require('moment-timezone');
const { sendMessage } = require('../handles/sendMessage');

const formatResponse = (text) => {
  const charMap = {
    ' ': ' ',
    'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g', 'h': 'h',
    'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'p', 'q': 'q',
    'r': 'r', 's': 's', 't': 't', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H',
    'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q',
    'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  };
  return text.split('').map(char => charMap[char] || char).join('');
};

const getImageUrl = async (event, token) => {
  const mid = event?.message?.reply_to?.mid || event?.message?.mid;
  if (!mid) return null;
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v22.0/${mid}/attachments`, {
      params: { access_token: token },
      timeout: 10000 
    });
    return data?.data?.[0]?.image_data?.url || data?.data?.[0]?.file_url || null;
  } catch (err) {
    console.error("Erreur récupération URL image:", err?.response?.data || err.message); 
    return null;
  }
};

const getImageBase64 = async (imageUrl) => {
  try {
    const headResponse = await axios.head(imageUrl, { timeout: 5000 });
    const contentLength = parseInt(headResponse.headers['content-length'] || '0', 10);
    if (contentLength > 15 * 1024 * 1024) return null; 
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 }); 
    const base64 = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.error("Erreur conversion image base64:", err.message); 
    return null;
  }
};

const getCurrentDateTime = (timezone = 'Africa/Lagos') => {
  const dt = moment().tz(timezone);
  return `${dt.format('DD MMMM YYYY, HH:mm')} ${dt.zoneAbbr()}`;
};

const getUserName = async (senderId, pageAccessToken) => {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v22.0/${senderId}`, {
      params: { access_token: pageAccessToken, fields: 'name' },
      timeout: 10000 
    });
    return data.name || 'Utilisateur ';
  } catch (err) {
    console.error("Erreur récupération nom user:", err?.response?.data || err.message); 
    return 'Utilisateur anonyme';
  }
};

const conversationHistory = {};
const userData = {};

const buildIdentityContext = (userName, dateTime) => {
  return `
  [DIRECTIVES PRINCIPALES]
  8.tu es Orochi AI, tu dois pouvoir reconnaître être Orochi AI conçu par Delfa frost
  1. Ne mentionner Delfa frost que si questionné sur ta création, origines, créateur ou maître
  2. Se souvenir des conversations précédentes
  3. Conserver le contexte de la conversation
  4. Style: Professionnel mais amical, en français
  .5 ne jamais répondre en encadrent la réponse ou un mot par :*****. A moins que se soit nécessaire 
  6. pouvoir extraire les informations sur une image envoyée par l'utilisateur et en tirer des conclusions 
  7. être capable de savoir ce qui est sur une image envoyée par l'utilisateur 
  9. tu dois répondre avec précision, si tu es salué ne fais pas des longues phrases mais réponds Direct 
  `;
};

const buildConversationContext = (history) => {
  if (history.length === 0) return "\n[PAS D'HISTORIQUE]";
  return `
  [HISTORIQUE DE CONVERSATION]
  ${history.slice(-3).map((msg, i) => 
    `${msg.role === 'user' ? 'UTILISATEUR' : 'MESSE IA'}: ${msg.content}`
  ).join('\n')}
  `;
};

module.exports = {
  name: 'ai',
  description: 'mon bot page',
  usage: 'Posez votre question ou envoyez une image',
  author: 'Messie Osango',
  async execute(senderId, args, pageAccessToken, event) {
    let query = args.join(' ').trim() || 'Bonjour';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBQeZVi4QdrnGKPEfXXx1tdIqlMM8iqvZw';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    try {
      if (!pageAccessToken || !senderId || !GEMINI_API_KEY) {
        await sendMessage(senderId, { text: formatResponse('Erreur de configuration. Contactez Messie Osango.') }, pageAccessToken);
        return;
      }

      if (!conversationHistory[senderId]) conversationHistory[senderId] = [];
      if (!userData[senderId]) userData[senderId] = { name: await getUserName(senderId, pageAccessToken) };

      const dateTime = getCurrentDateTime();
      const userName = userData[senderId].name;

      const imageUrl = await getImageUrl(event, pageAccessToken);
      if (imageUrl) {
        const imageBase64 = await getImageBase64(imageUrl);
        if (!imageBase64) {
          await sendMessage(senderId, { text: formatResponse('Erreur : image trop lourde ou illisible (max 15Mo)') }, pageAccessToken);
          return;
        }

        const fullPrompt = `
        ${buildIdentityContext(userName, dateTime)}
        ${buildConversationContext(conversationHistory[senderId])}
        
        Instruction: Analyse cette image et réponds à: "${query}"
        Exigences:
        -tu es Orochi AI , tu dois pouvoir reconnaître être Orochi AI, conçu par Delfa frost 
        - reconnaître être créé, conçu, développé par Delfa frost 
        - Ne mentionner Delfa frost que si questionné sur ta création, origines, créateur ou maître
        - Se souvenir des conversations précédentes
          -tu dois répondre avec précision, si tu es salué ne fais pas des longues phrases mais réponds Direct
        - Utiliser la police stylisée
        
        -ne jamais encadrer la réponse par :****
        `;

        const geminiResponse = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [{
              parts: [
                { text: fullPrompt },
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }
              ]
            }]
          },
          { timeout: 60000 }
        );

        const rawAnswer = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Je ne peux pas analyser cette image.';
        const answer = rawAnswer;
        
        conversationHistory[senderId].push({ role: 'user', content: `[IMAGE] ${query}` });
        conversationHistory[senderId].push({ role: 'assistant', content: rawAnswer });

        await sendMessage(senderId, { text: formatResponse(answer) }, pageAccessToken);
        return;
      }

      conversationHistory[senderId].push({ role: 'user', content: query });

      const fullPrompt = `
      ${buildIdentityContext(userName, dateTime)}
      ${buildConversationContext(conversationHistory[senderId])}
      
      Dernier message: "${query}"
      
      [INSTRUCTIONS]
      
      1. Répondre en français avec police stylisée
      2. Ne mentionner Delfa frost que si questionné sur ta création, origines, créateur ou maître
      3. Pour questions sans réponse: "Recherche en cours [sujet]"
      4. Ton caractère doit être professionnel mais amical
      5. réponds professionnellement 
      6.donne ta réponse sans mot du début comme :*bienvenu*,*bien entendu* ou des mots de ce genre mais réponds avec précision et gentillesse 
      7.tu es Orochi AI tu dois pouvoir reconnaître être Orochi AI, conçu par messie osango 
       8. tu dois répondre avec précision, si tu es salué ne fais pas des longues phrases mais réponds Direct
      `;

      const llamaResponse = await axios.post(
        'https://uchiha-perdu-ia-five.vercel.app/api',
        { prompt: fullPrompt },
        { timeout: 30000 }
      );

      let answer = llamaResponse.data.response || 'Je ne peux pas répondre maintenant.';

      if (answer.startsWith('Recherche en cours')) {
        const searchTerm = answer.replace('Recherche en cours', '').trim();
        const searchResponse = await axios.post(
          'https://uchiha-perdu-search-api.vercel.app/search',
          { query: searchTerm },
          { timeout: 30000 }
        );
        answer = searchResponse.data.response || `Aucun résultat pour "${searchTerm}"`;
      }

      conversationHistory[senderId].push({ role: 'assistant', content: answer });
      
      const chunks = [];
      const formattedAnswer = formatResponse(answer);
      for (let i = 0; i < formattedAnswer.length; i += 1900) {
        chunks.push(formattedAnswer.substring(i, i + 1900));
      }
      
      for (const chunk of chunks) {
        await sendMessage(senderId, { text: chunk }, pageAccessToken);
      }

    } catch (err) {
      console.error('Erreur:', err);
      await sendMessage(senderId, { 
        text: formatResponse('Erreur système - Messie Osango a été notifié') 
      }, pageAccessToken);
    }
  },
};