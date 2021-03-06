const { App } = require('@slack/bolt');
const db = require('./db');
var users = require('./users');
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `What's up <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});


app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  console.log('~~Awaiting ack');
  await ack();
  console.log('~~ack');
  await say(`<@${body.user.id}> clicked the button`);
});

app.event('user_change', async ({ event, client, context }) => {
  try{
      var user = event.user;
      var status = user.profile.status_text;

      if(status.includes("Kitchen")){       
        console.log('~ Status is Kitchen');
        users.upsertUserWithStatus(user.id, true, (err,res)=>{
          if (err){
            console.log('ERROR upsertUserWithStatus:', err.stack);
          } else {
            users.queryUsersInRooms((err,res)=>{
              if (err){
                console.log('ERROR queryUsersInRooms:', err.stack);
              } else {
                let openChatRooms = res.rows.filter(row => row.current_users<5 && row.chat_id!=null);
                if (openChatRooms.length>0){
                  let chatId = openChatRooms[0].chat_id;
                  console.log("sending chat id " + chatId + " to user " + user.id);
                  users.updateUsersWithChatId(chatId, [user.id], (err,res)=>{
                    if (err){
                      console.log('ERROR updateUsersWithChatId:', err.stack);
                    } else {
                      sendChatLink(client, user.id, chatId);
                    }
                  });
                } else {
                  console.log("no open chat rooms");
                  let usersNotChatting = res.rows.find(row => row.chat_id == null);
                  if (usersNotChatting && usersNotChatting.current_users >= 3){
                    console.log('3 or more users waiting. starting new chat room.');
                    users.addChat((err,res)=>{
                      if (err){
                        console.log("ERROR addChat: ", err.stack);
                      } else {
                        let chatId = res.rows[0].id;
                        users.getAvailableUsersNotChatting((err,res)=>{
                          if (err){
                            console.log('ERROR getAvailableUsersNotChatting:', err.stack);
                          } else {
                            let userIds = res.rows.map(row => row.slack_id);
                            users.updateUsersWithChatId(chatId, userIds, null);
                            userIds.map(userId => sendChatLink(client, userId, chatId));
                          }
                        });
                      }
                    });
                  } else {
                    console.log('not enough users waiting yet');
                    sendWaitingMessage(client, user.id);
                  }
                }
              }
            });
          }
        });
      } else {
        console.log('~ Status NOT Kitchen');
        users.upsertUserWithStatus(user.id, false, (err,res)=>{
          if (err){
            console.log('ERROR upsertUserWithStatus:', err.stack)
          }
        });
      }
  }
  catch(error){
      console.log(error);
  }
});

function sendWaitingMessage(client, userId){
  const result = client.chat.postMessage({
    channel: userId,
    text: "Waiting for other folks to come to the kitchen...  :cat-on-keyboard:"
  });
}

function sendChatLink(client, userId, chatId){
  console.log('send chat id ' + chatId + ' to user ' + userId);
  const result = client.chat.postMessage({
    channel: userId,
    text: "Hi! Would you like to join a kitchen chat? <http://g.co/meet/kitchenslack" + chatId + "|Join here!> :virtual-meeting:"
  });
}

function processResuls (res, callback){
  console.log('~In ProcessResult:', res.rowCount);
  if(res.rowCount > 2){
    callback(true);
  }
};

app.event('app_home_opened', async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    var homeBlocks = [ {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Welcome to Kitchen Chat!* :coffee:"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "With this slackbot, you can join a conversation with your coworkers that are 'in the kitchen'. To do this, simply set your slack status to 'Kitchen'"
      }
    }];
    users.queryUsersInRooms((err,res) => {
      if (err) {
        console.log(err.stack);
      } else {
          var text = "";
          for(var i = 0; i < res.rowCount; i ++){
                var row = res.rows[i];
                text += ">There are currently " + row.current_users + " users in room " + row.chat_id + ".";
          }
          var block = {
            "type" : "section",
            "text" : {
              "type" : "mrkdwn",
              "text" : text
            }
          }
          homeBlocks.push(block);

          client.views.publish({
            /* the user that opened your app's app home */
            user_id: event.user,
            /* the view object that appears in the app home*/
            view: {
              type: 'home',
              callback_id: 'home_view',
              blocks: homeBlocks
            }
          });
        }
    });
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
