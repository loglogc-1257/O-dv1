const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = '-';

// Load command modules
fs.readdirSync(path.join(__dirname, '../commands'))
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`../commands/${file}`);
    if (command.name) {
      commands.set(command.name.toLowerCase(), command);
    } else {
      console.error(`Error: Command file ${file} is missing a 'name' property.`);
    }
  });

async function handleMessage(event, pageAccessToken) {
  const senderId = event?.sender?.id;
  if (!senderId) return console.error('Invalid event object');

  // Récupère les informations de l'utilisateur (dont le nom)
  const profileUrl = `https://graph.facebook.com/v19.0/${senderId}?fields=first_name,last_name,name&access_token=${pageAccessToken}`;
  const profileResponse = await axios.get(profileUrl);
  const userName = profileResponse.data.name;

  // Passe le nom à manageUserAccess
  const access = await manageUserAccess(senderId, userName);

  const messageText = event?.message?.text?.trim();
  if (!messageText) return console.log('Received event without message text');

  const [commandName, ...args] = messageText.startsWith(prefix)
    ? messageText.slice(prefix.length).split(' ')
    : messageText.split(' ');

  try {
    if (commands.has(commandName.toLowerCase())) {
      await commands.get(commandName.toLowerCase()).execute(senderId, args, pageAccessToken, sendMessage);
    } else {
      await commands.get('ai').execute(senderId, [messageText], pageAccessToken);
    }
  } catch (error) {
    console.error(`Error executing command:`, error);
    await sendMessage(senderId, { text: error.message || 'There was an error executing that command.' }, pageAccessToken);
  }
}

module.exports = { handleMessage };
