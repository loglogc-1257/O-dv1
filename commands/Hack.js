const axios = require('axios');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'hack',
  description: 'Generate a hack meme',
  usage: 'hack <name> <uid>',
  author: 'Developer',

  async execute(senderId, args, pageAccessToken) {
    if (!args || !Array.isArray(args) || args.length < 2) {
      await sendMessage(senderId, { text: 'Usage: hack <name> <uid>' }, pageAccessToken);
      return;
    }

    const name = args.slice(0, -1).join(' ');
    const uid = args[args.length - 1];

    try {
      const apiUrl = `https://api-canvass.vercel.app/hack?name=${encodeURIComponent(name)}&uid=${uid}`;
      await sendMessage(senderId, { attachment: { type: 'image', payload: { url: apiUrl } } }, pageAccessToken);
    } catch (error) {
      await sendMessage(senderId, { text: 'Error: Could not generate hack meme.' }, pageAccessToken);
    }
  }
};
