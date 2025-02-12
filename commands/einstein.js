const axios = require('axios');
const fs = require('fs-extra');
const { loadImage, createCanvas } = require('canvas');

const wrapText = (ctx, text, maxWidth) => {
    return new Promise(resolve => {
        if (ctx.measureText(text).width < maxWidth) return resolve([text]);
        if (ctx.measureText('W').width > maxWidth) return resolve(null);
        const words = text.split(' ');
        const lines = [];
        let line = '';
        while (words.length > 0) {
            let split = false;
            while (ctx.measureText(words[0]).width >= maxWidth) {
                const temp = words[0];
                words[0] = temp.slice(0, -1);
                if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
                else {
                    split = true;
                    words.splice(1, 0, temp.slice(-1));
                }
            }
            if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
            else {
                lines.push(line.trim());
                line = '';
            }
            if (words.length === 0) lines.push(line.trim());
        }
        return resolve(lines);
    });
};

module.exports = {
    config: {
        name: "einstein",
        version: "1.0.1",
        role: 0,
        author: "MILAN",
        shortDescription: "Ajoute du texte à une image d'Einstein",
        category: "image",
        guide: "einstein [texte]",
        countDown: 10,
    },

    onStart: async function ({ event, api, args }) {
        const { threadID, messageID } = event;
        const pathImg = __dirname + '/cache/einstein.png';
        const text = args.join(' ');

        if (!text) return api.sendMessage('Veuillez entrer un texte à afficher sur l\'image.', threadID, messageID);

        try {
            // Téléchargement de l'image de base
            const imageUrl = 'https://i.ibb.co/941yM5Y/Picsart-22-08-13-21-34-35-220.jpg';
            const imageBuffer = (await axios.get(imageUrl, { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(pathImg, Buffer.from(imageBuffer, 'utf-8'));

            // Chargement de l'image et création du canvas
            const baseImage = await loadImage(pathImg);
            const canvas = createCanvas(baseImage.width, baseImage.height);
            const ctx = canvas.getContext('2d');

            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            ctx.font = "400 35px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "start";

            let fontSize = 45;
            while (ctx.measureText(text).width > 2250) {
                fontSize--;
                ctx.font = `400 ${fontSize}px Arial`;
            }

            const lines = await wrapText(ctx, text, 320);
            ctx.fillText(lines.join('\n'), 300, 90);

            // Sauvegarde de l'image modifiée
            const outputBuffer = canvas.toBuffer();
            fs.writeFileSync(pathImg, outputBuffer);

            // Envoi de l'image modifiée
            return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);

        } catch (error) {
            console.error(error);
            return api.sendMessage('Une erreur est survenue lors de la génération de l\'image.', threadID, messageID);
        }
    }
};
