const axios = require('axios');

function sendMessage(senderId, message, pageAccessToken) {
    if (!message || (!message.text && !message.attachment)) {
        console.error('Error: Message must provide valid text or attachment.');
        return;
    }

    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
    const payload = {
        recipient: {
            id: senderId,
        },
        message: {}
    };

    if (message.text) {
        payload.message.text = message.text;
    }

    if (message.attachment) {
        payload.message.attachment = message.attachment;
    }

    axios.post(url, payload)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Failed to send message:', error.response.data);
        });
}

module.exports = {
    sendMessage,
};
