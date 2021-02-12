const { App } = require('@slack/bolt');

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
  // say() sends a message to the channel where the event was triggered
  //userId can be found in event.user.id
  try{
      var user = event.user;
      var status = user.profile.status_text;

      if(status.includes("Kitchen")){
          const result = await client.chat.postMessage({
          channel: user.id,
          text: "Would you like to join kitchen chat? <http://g.co/meet/kitchenslack1|Join here!"
        });
      }
  }
  catch(error){
      console.log(error);
  }
});

app.event('app_home_opened', async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
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
              "text": "With this slackbot, you can opt into a conversation with your other coworkers that are 'in the kitchen'. To do this, simply set your slack status to kitchen"
            }
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
  console.log('~~awaiting say');
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
