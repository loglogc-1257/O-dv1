// ... (le reste du code)

// FONCTION POUR ENVOYER UNE NOTIFICATION AU PARRAIN
async function notifyReferrer(referrerId, referredName, pageAccessToken) {
    const message = {
        text: `🥳 Félicitations ! Votre ami ${referredName} a été ajouté et vous avez maintenant un accès illimité pour la journée.`
    };
    await sendMessage(referrerId, message, pageAccessToken);
}

// ... (le reste du code)

module.exports = {
  name: 'ai',
  description: 'Interact with AI (fastest responder wins)',
  usage: 'gpt4 [your message]',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken, userName) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: "Veuillez poser votre question ou tapez 'help' pour voir les autres commandes disponibles."
      }, pageAccessToken);
    }
    
    // GESTION DES COMMANDES SPÉCIALES
    const lowerPrompt = prompt.toLowerCase();
    
    // Commande pour obtenir l'ID
    if (lowerPrompt === 'id') {
      return sendMessage(senderId, {
        text: `Voici votre ID unique : ${senderId}`
      }, pageAccessToken);
    }
    
    // Commande de parrainage manuel ou pour obtenir le lien
    if (lowerPrompt.startsWith('parrainer') || lowerPrompt.startsWith('invite')) {
      const friendId = prompt.split(' ')[1];
      if (!friendId) {
        const myReferralLink = `https://m.me/61579366125633?ref=invite_${senderId}`;
        return sendMessage(senderId, {
          text: `✨ Pour obtenir un accès illimité, parrainez un ami ! Voici votre lien de parrainage unique : ${myReferralLink}\n\n` +
                `Si votre ami est déjà un utilisateur, il doit vous donner son ID et vous le tapez : 'invite [son_id]'`
        }, pageAccessToken);
      }

      const friendExists = await findUserById(friendId);
      if (friendExists) {
        const referralCreated = await createReferral(senderId, friendId);
        if (referralCreated) {
          await giveUnlimitedAccess(senderId); // Le parrain gagne un accès illimité
          // On notifie le parrain
          // Pour cette notification, il faudrait un moyen de connaître le nom de l'ami parrainé.
          // Pour simplifier, on peut juste dire "votre ami a été ajouté"
          await notifyReferrer(senderId, "votre ami", pageAccessToken);
          return sendMessage(senderId, {
            text: `✅ Parfait ! Vous avez parrainé un ami et vous avez maintenant un accès illimité pour la journée.`
          }, pageAccessToken);
        } else {
          return sendMessage(senderId, {
            text: "❌ Ce parrainage n'a pas pu être enregistré. Peut-être que cet utilisateur a déjà été invité."
          }, pageAccessToken);
        }
      } else {
        return sendMessage(senderId, {
          text: `❌ Nous n'avons pas pu trouver d'utilisateur avec l'ID '${friendId}'. Veuillez vous assurer que votre ami a déjà interagi avec le bot.`
        }, pageAccessToken);
      }
    }
    
    // GESTION DU PARRAINAGE VIA LE LIEN AUTOMATIQUE
    if (prompt === 'referral') {
        const referrerId = prompt.split('_')[1]; // On extrait l'ID du parrain
        if (referrerId && referrerId !== senderId) {
            await giveUnlimitedAccess(senderId); // Le nouvel utilisateur gagne son accès illimité
            // On notifie le parrain qui a son propre accès illimité pour la journée
            await notifyReferrer(referrerId, userName, pageAccessToken);
        }
        return sendMessage(senderId, {
            text: `🥳 Félicitations ! Vous avez été parrainé par un ami et vous avez maintenant un accès illimité pour la journée. Posez votre question.`
        }, pageAccessToken);
    }
    
    // Commande pour le code journalier
    const isCodeValid = await validateDailyCode(prompt);
    if (isCodeValid) {
        await giveUnlimitedAccess(senderId);
        return sendMessage(senderId, {
            text: "✅ Code valide ! Vous avez maintenant un accès illimité pour la journée. Posez votre question."
        }, pageAccessToken);
    }

    // GESTION DES SALUTATIONS
    const greetings = ['salut', 'hi', 'hello', 'bonjour'];
    if (greetings.includes(lowerPrompt)) {
      return sendMessage(senderId, {
        text:
          "👋 Bonjour et bienvenue !\n\n" +
          "Merci d'utiliser notre intelligence artificielle. 🙏\n\n" +
          "✨ Pour nous aider, n'hésitez pas à partager cette IA dans vos groupes et à inviter vos amis à la découvrir.\n\n" +
          "✅ Votre satisfaction est notre priorité absolue."
      }, pageAccessToken);
    }

    // VÉRIFICATION DES POINTS POUR LES MESSAGES NORMAUX
    const access = await manageUserAccess(senderId, userName);
    if (!access.allowed) {
      return sendMessage(senderId, {
        text: "✨ Vos 6 questions gratuites sont terminées ! ✨\n\n" +
              "Pour un accès illimité, veuillez entrer le code journalier que vous trouverez dans notre dernière vidéo TikTok.\n\n" +
              "Lien de la dernière vidéo : " + "https://vm.tiktok.com/ZMHnCEyoJxE5H-tZJ7Y/" + "\n\n" +
              "Ou, si vous préférez, vous pouvez parrainer un ami ! Tapez 'parrainer' pour obtenir votre lien de parrainage."
      }, pageAccessToken);
    }

    // Le reste du code d'appel des APIs
    await addMessageToHistory(senderId, 'user', prompt);
    const history = await getConversationHistory(senderId);
    // ... (le reste du code)
