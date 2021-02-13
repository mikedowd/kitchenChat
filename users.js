var db = require('./db');

let upsert = "INSERT INTO kitchen_users(slack_id, in_kitchen) VALUES($1,$2) ON CONFLICT('slack_id') DO UPDATE SET in_kitchen=EXCLUDED.in_kitchen;";
let checkUserCount = "SELECT COUNT(slack_id), chat_id FROM kitchen_users GROUP BY chat_id WHERE in_kitchen = true;";
module.exports = {
    upsertUser: (slackId, inKitchen) => {
        db.query(upsert, [slackId, inKitchen]);
    },
    queryUsersInRooms : function(){
        return db.query(checkUserCount);
    }
}