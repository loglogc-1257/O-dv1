const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');
const path = require('path');

// API Gemini 2.0 Flash — NE PAS exposer en production
const GEMINI_API_KEY = 'AIzaSyAV0s2XU0gkrfkWiBOMxx6d6AshqnyPbiE';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Fichier JSON où les images sont stockées temporairement
const imageFilePath = path.join(__dirname, '../data/image.json');

module.exports = {
  name: 'Ai',
  description: 'Interagit avec Gemini 2.0 (texte et/ou image).',
  usage: 'Ai [question] ou envoyez une image avant de poser une question.',
  author: 'Raniel',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    let imageData = {};
    try {
      imageData = JSON.parse(fs.readFileSync(imageFilePath, 'utf8')) || {};
    } catch (err) {
      console.error('Erreur lecture image.json :', err);
    }

    const imageUrl = imageData[senderId];

    if (imageUrl && prompt) {
      // Prompt avec image
      try {
        const base64Image = await getBase64FromUrl(imageUrl);
        const payload = {
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/png', // tu peux détecter le vrai type si besoin
                  data: base64Image
                }
              }
            ]
          }]
        };

        const response = await axios.post(GEMINI_API_URL, payload);
        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse générée.";

        await sendMessage(senderId, { text: result }, pageAccessToken);
      } catch (err) {
        console.error('Erreur avec prompt + image :', err.message);
        await sendMessage(senderId, { text: "Erreur lors de l'analyse de l'image." }, pageAccessToken);
      } finally {
        delete imageData[senderId];
        fs.writeFileSync(imageFilePath, JSON.stringify(imageData, null, 2), 'utf8');
      }

    } else if (prompt) {
      // Prompt seul (texte)
      try {
        const payload = {
          contents: [{
            parts: [{ text: prompt }]
          }]
        };

        const response = await axios.post(GEMINI_API_URL, payload);
        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse générée.";

        await sendMessage(senderId, { text: result }, pageAccessToken);
      } catch (err) {
        console.error('Erreur avec prompt seul :', err.message);
        await sendMessage(senderId, { text: "Erreur lors de la génération de la réponse." }, pageAccessToken);
      }

    } else {
      // Ni prompt ni image
      await sendMessage(senderId, {
        text: "Utilisation : Ai <votre question> ou envoyez une image d'abord, puis une question."
      }, pageAccessToken);
    }
  }
};

// Convertir une image en base64 à partir d'une URL
async function getBase64FromUrl(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data).toString('base64');
}
