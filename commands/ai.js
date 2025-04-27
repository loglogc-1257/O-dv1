const axios = require('axios');  
 const crypto = require('crypto');  
  
 exports.config = {  
     name: 'ai',  
     author: 'Delfa frost',  
     description: 'Discuter avec Orochi Ai',  
     method: 'get',  
     category: 'Intelligence Artificielle',  
     link: ['/asios-chat?prompt=hello&uid=123']  
 };  
  
 const conversationContexts = new Map();  
  
 exports.initialize = async function ({ req, res }) {  
     try {  
         const prompt = req.query.prompt;  
         const uid = req.query.uid;  
  
         if (!prompt) {  
             return res.json({  
                 response: "Error: Add ?prompt=your_message_here",  
                 author: "Orochi Ai 🤖"  
             });  
         }  
  
         if (!uid) {  
             return res.json({  
                 response: "Error: Add &uid=your_user_id",  
                 author: "Orochi Ai 🤖"  
             });  
         }  
  
         const conversationId = crypto.createHash('md5').update(uid).digest('hex');  
         let conversationContext = conversationContexts.get(conversationId) || [];  
  
         if (conversationContext.length > 20) {  
             conversationContext = conversationContext.slice(-20);  
         }  
  
         const response = await axios.get(`https://asios-api.vercel.app/api/asios`, {  
             params: {  
                 q: prompt,  
                 userId: uid  
             }  
         });  
  
         conversationContext.push({  
             role: "user",  
             content: prompt  
         });  
         conversationContext.push({  
             role: "assistant",  
             content: response.data.response  
         });  
          
         conversationContexts.set(conversationId, conversationContext);  
  
         res.json({  
             response: response.data.response,  
             author: "Orochi Ai 🤖"  
         });  
  
     } catch (error) {  
         console.error("Error:", error.message);  
         res.json({  
             response: "Une erreur s'est produite lors de la communication avec l'API",  
             author: "Orochi Ai 🤖"  
         });  
     }  
 };