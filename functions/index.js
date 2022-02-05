const functions = require("firebase-functions");

const admin = require("firebase-admin");
const { user } = require("firebase-functions/v1/auth");

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
/*  This function will push a notification to a client once their job has been assigned,
    once an agent has arrived onsite and it also notifies an artisan once they have been assigned to a job
*/



/* exports.chatNotification = functions.firestore.document('ChatThreads/{thread_id}').onUpdate( async (change, context) =>{
    let oldThread = change.before.data();
    let newThread = change.after.data();
    let db = admin.firestore();
    let userPromise; 
    let user;
    let payload;
    let type = "";
    let token = "";

    if(newThread.last_message.from == newThread.client.uid && newThread.chat_messages.length > oldThread.chat_messages.length){
        user = (await (await db.collection('Agents').doc(newThread.agent.uid).get()).data());
        type = "agent";
    }else if(newThread.last_message.from == newThread.agent.uid && newThread.chat_messages.length > oldThread.chat_messages.length){
        //the client must notified that the agent has arrived
        user = (await (await db.collection('Users').doc(newThread.client.uid).get()).data());
        type = "client";
    }else{
        user = (await (await db.collection('Users').doc(newThread.client.uid).get()).data());
        type = "client";
    }

    userPromise = user;
    
    token = userPromise.fcm_token;

    if(type == "client"){
        payload = {
            notification: {
              title: 'New message on Clickinn!',
              body: newThread.last_message.message,
              icon: newThread.agent.photoURL
            }
        };
    }else if(type == "agent"){
        payload = {
            notification: {
              title: 'New message on Clickinn!',
              body: newThread.last_message.message,
              icon: 'https://firebasestorage.googleapis.com/v0/b/clickinn-996f0.appspot.com/o/logo.png?alt=media&token=12456cd3-4caf-41f6-8c6e-df8460f2ff88'
            }
        };
    }

    functions.logger.info(userPromise);
    const tokensToRemove = [];

    if(token != "" && payload){
        let response = admin.messaging().sendToDevice(userPromise.fcm_token, payload);
        (await response).results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                functions.logger.error(
                'Failure sending notification to',
                token,
                error
                );
                // Cleanup the tokens who are not registered anymore.
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(tokensSnapshot.ref.child(token).remove());
                }
            }
        })
        return Promise.all(tokensToRemove);
    }else{
        return Promise.all("no tokens to remove");
    }
}) */